import os
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage, UserMessage
from azure.core.credentials import AzureKeyCredential
import json


endpoint = os.getenv("AZURE_INFERENCE_SDK_ENDPOINT", "https://ai-9804549640182ai647595511482.services.ai.azure.com/models")
model_name = os.getenv("DEPLOYMENT_NAME", "DeepSeek-R1")
key = os.getenv("AZURE_INFERENCE_SDK_KEY", "CPqsqenbY3VTcJhgoSg5EbBKsDAbONDf52vES4N08RIaA0CDBqKWJQQJ99BCACHYHv6XJ3w3AAAAACOGyZI5")
client = ChatCompletionsClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# 发送流式请求
try:
    response = client.complete(
        messages=[
            SystemMessage(content="You are a helpful assistant."),
            UserMessage(content="what is gpt")
        ],
        model=model_name,
        max_tokens=1000,
        stream=True
    )

    # 逐步处理和显示响应
    for chunk in response:
        # 如果 chunk 是字符串，可能是 SSE 格式
        if isinstance(chunk, str):
            # 检查是否以 "data: " 开头（SSE 格式）
            if chunk.startswith("data: "):
                # 提取 JSON 数据并解析
                json_data = chunk[len("data: "):].strip()
                if json_data == "[DONE]":  # 流结束标志
                    break
                try:
                    parsed_chunk = json.loads(json_data)
                    # 提取增量内容
                    if "choices" in parsed_chunk and parsed_chunk["choices"]:
                        delta_content = parsed_chunk["choices"][0]["delta"].get("content")
                        if delta_content is not None:
                            print(delta_content, end="", flush=True)
                except json.JSONDecodeError:
                    continue  # 跳过无法解析的块
        else:
            # 如果 chunk 已解析为对象（理论上的 SDK 行为）
            try:
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    print(chunk.choices[0].delta.content, end="", flush=True)
            except AttributeError:
                continue  # 跳过无效块
    print()  # 最后换行

except Exception as e:
    print(f"Error: {e}")