from argparse import ArgumentParser
from json import JSONDecodeError, dumps, loads
from pathlib import Path, PosixPath

from ddgs import DDGS
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from llama_cpp import Llama
from uvicorn import run

parser = ArgumentParser(description="Magi LLM Council")

parser.add_argument("--gguf", type=Path, help="Path to a gguf file")
args = parser.parse_args()
target_path = args.gguf

if target_path.exists():
    if target_path.is_dir():
        raise RuntimeError(f"Given path {target_path} does not lead to a file.")
    if str(target_path).split(".")[-1] != "gguf":
        raise RuntimeError(f"Given path {target_path} does not lead to a gguf file.")
else:
    raise RuntimeError(f"Given path {target_path} does not exists.")

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH: PosixPath = target_path
llm = Llama(model_path=str(MODEL_PATH), n_ctx=4096, n_threads=4, n_gpu_layers=0)


def search_web(query, max_results=3):
    try:
        with DDGS() as ddgs:
            results = [r for r in ddgs.text(query, max_results=max_results)]
            if not results:
                return "No result."

            context = "\n".join(
                [f"Source: {r['title']}\nContenu: {r['body']}" for r in results]
            )
            return context
    except Exception as e:
        return f"Error during web search: {e!s}"


@app.post("/api/chat/stream")
async def chat_stream(request: Request):
    try:
        body_bytes = await request.body()
        body_str = body_bytes.decode("utf-8")
        data = loads(body_str)
        user_text = data.get("content", "")
        if not user_text.strip():

            async def standby_generator():
                yield f"data: {dumps({'sender': 'system', 'text': '// Awaiting query...'})}\n\n"

            return StreamingResponse(
                standby_generator(), media_type="text/event-stream"
            )

    except JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {e!s}")

    # messages = data.get("messages", [])

    # last_user_message = messages[-1]["content"]
    last_user_message = user_text
    messages = [data]

    # if app.rag:
    print(f"Searching: '{last_user_message}'...")
    web_context = search_web(last_user_message)
    # else:
    #    web_context = ""

    system_prompt = (
        "You are an AI Assistant. You have been given RAG capabilities. "
        "Here is some up-to-date information found on the web to help you answer the user. "
        "Draft a clear and concise response using this data if it is relevant.\n\n"
        f"--- WEB DATA TIMELINE ---\n{web_context}\n----------------"
    )

    llm_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        if msg["role"] != "system":
            llm_messages.append(msg)

    async def event_generator():
        response_stream = llm.create_chat_completion(
            messages=llm_messages, temperature=0.3, stream=True
        )

        for chunk in response_stream:
            delta = chunk["choices"][0]["delta"]
            if "content" in delta:
                token = delta["content"]
                yield f"data: {dumps({'sender': 'system', 'text': token})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


if __name__ == "__main__":
    run("index:app", host="127.0.0.1", port=8000, reload=True)
