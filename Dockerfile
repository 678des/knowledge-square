# Node.jsの軽量イメージを使用
FROM node:20-alpine

# コンテナ内の作業ディレクトリを指定
WORKDIR /app

# パッケージ情報をコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリの全コードをコピー
COPY . .

# 開発用サーバーを起動（ポート3000）
EXPOSE 3000
CMD ["npm", "run", "dev"]