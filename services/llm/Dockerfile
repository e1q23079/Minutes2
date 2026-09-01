FROM ollama/ollama

RUN ollama serve & \
    sleep 5 && \
    ollama pull gemma2:2b

CMD ["serve"]
