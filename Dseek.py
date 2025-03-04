import os
from flask import Flask, Response, request
from flask_cors import CORS
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
import json

app = Flask(__name__)
CORS(app, resources={r"/stream": {"origins": "http://localhost:8000"}})

def stream_input(input_content="introduce yourself"):
    endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://ai-9804549640182ai647595511482.services.ai.azure.com/models")
    model_name = os.getenv("DEPLOYMENT_NAME", "DeepSeek-R1")
    key = os.getenv("AZURE_INFERENCE_SDK_KEY", "CPqsqenbY3VTcJhgoSg5EbBKsDAbONDf52vES4N08RIaA0CDBqKWJQQJ99BCACHYHv6XJ3w3AAAAACOGyZI5")
    client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

    try:
        response = client.complete(
            messages=[
                SystemMessage(content="You are a helpful assistant."),
                UserMessage(content=input_content)
            ],
            model=model_name,
            max_tokens=1000,
            stream=True
        )

        for chunk in response:
            if isinstance(chunk, str):
                if chunk.startswith("data: "):
                    json_data = chunk[len("data: "):].strip()
                    if json_data == "[DONE]":
                        yield "data: [DONE]\n\n"
                        break
                    try:
                        parsed_chunk = json.loads(json_data)
                        if "choices" in parsed_chunk and parsed_chunk["choices"]:
                            delta_content = parsed_chunk["choices"][0]["delta"].get("content")
                            if delta_content is not None:
                                yield f"data: {delta_content}\n\n"
                    except json.JSONDecodeError:
                        continue
            else:
                try:
                    if chunk.choices and chunk.choices[0].delta.content is not None:
                        yield f"data: {chunk.choices[0].delta.content}\n\n"
                except AttributeError:
                    continue
    except Exception as e:
        yield f"data: Error: {e}\n\n"

@app.route('/stream', methods=['GET'])
def stream():
    # 从查询参数获取输入内容，默认值是 "introduce yourself"
    input_content = request.args.get('input', default="introduce yourself")
    
    # 返回流式响应，指定 MIME 类型为 text/event-stream
    return Response(stream_input(input_content), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)