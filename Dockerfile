FROM oven/bun:latest

RUN apt update && apt install git -y

RUN git clone https://github.com/kurisubrooks/tfnsw-pids --branch feat/rewrite .

RUN bun install

EXPOSE 5173 
ENTRYPOINT [ "bun", "run", "dev", "--host" ]