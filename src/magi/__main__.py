from argparse import ArgumentParser
from json import dumps
from pathlib import Path, PosixPath

from ddgs import DDGS
from flask import Flask, Response, jsonify, render_template, request
from flask_cors import CORS
from llama_cpp import Llama

app = Flask(__name__, template_folder=".")
CORS(app)

app.rag = False

parser = ArgumentParser(description="LLM ChatBox")

parser.add_argument("gguf_path", type=Path, help="Path to a gguf file")
args = parser.parse_args()
target_path = args.gguf_path

if target_path.exists():
    if target_path.is_dir():
        raise RuntimeError(f"Given path {target_path} does not lead to a file.")
    if str(target_path).split(".")[-1] != "gguf":
        raise RuntimeError(f"Given path {target_path} does not lead to a gguf file.")
else:
    raise RuntimeError(f"Given path {target_path} does not exists.")

MODEL_PATH: PosixPath = target_path
llm = Llama(model_path=str(MODEL_PATH), n_ctx=4096, n_threads=4, n_gpu_layers=0)


def search_web(query, max_results=3):
    try:
        with DDGS() as ddgs:
            results = [r for r in ddgs.text(query, max_results=max_results)]
            if not results:
                return "No results."

            context = "\n".join(
                [f"Source: {r['title']}\nContent: {r['body']}" for r in results]
            )
            return context
    except Exception as e:
        return f"Error during web search: {e!s}"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/toggle_rag", methods=["POST"])
def toggle_rag():
    _tmp = app.rag
    data = request.json
    print(data)
    value = data.get("value", None)
    if value is None:
        return jsonify({"error": ""}), 300

    app.rag = value if isinstance(value, bool) else False
    return jsonify({"success": f"{app.rag}"})


@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    messages = data.get("messages", [])

    last_user_message = messages[-1]["content"]

    if app.rag:
        print(f'Searching "{last_user_message}"...')
        web_context = search_web(last_user_message)
        system_prompt = (
            "You are an AI Assistant. You have been given RAG capabilities. "
            "Here is some up-to-date information found on the web to help you answer the user. "
            "Draft a clear and concise response using this data if it is relevant.\n\n"
            f"--- WEB DATA TIMELINE ---\n{web_context}\n----------------"
        )
    else:
        web_context = ""
        system_prompt = "You are an AI Assistant."

    llm_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if msg["role"] != "system":
            llm_messages.append(msg)

    def generate():
        response_stream = llm.create_chat_completion(
            messages=llm_messages, temperature=0.3, stream=True
        )

        for chunk in response_stream:
            delta = chunk["choices"][0]["delta"]
            if "content" in delta:
                token = delta["content"]
                yield f"data: {dumps({'token': token})}\n\n"

    return Response(generate(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080)
