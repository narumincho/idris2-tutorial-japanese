# Idris 2 チュートリアル（日本語版）

このプロジェクトは、Stefan Höck 氏および Idris Community による [idris-community/idris2-tutorial](https://github.com/idris-community/idris2-tutorial) の日本語翻訳版（非公式）です。

📖 **公開サイト:** <https://narumincho.github.io/idris2-tutorial-japanese/>  
📚 **目次:** [SUMMARY.md](src/SUMMARY.md)

---

## 🌐 翻訳について

- 本ドキュメントは、原著 [idris2-tutorial](https://github.com/idris-community/idris2-tutorial) の内容を **Gemini 3.7 Flash** を活用して日本語に翻訳したものです。
- 各ページの先頭に原文（英語版）へのリンクと翻訳クレジットを明記しています。
- 翻訳の改善や誤訳の修正、表記ゆれの修正などのコントリビューション（Pull Request や Issue）を歓迎しています。

---

## 📜 ライセンス (License)

本プロジェクトは、原著と同様に **[BSD 3-Clause License](LICENSE)** に基づいて公開・配布されています。

- **原著作権表示 (Original Copyright):**
  - Copyright (c) 2021, Stefan Höck
  - Copyright (c) 2025, Idris Community (Unofficial)
- **日本語翻訳 (Japanese Translation):**
  - Copyright (c) 2026, narumincho & Contributors

改変および再配布（二次的著作物としての翻訳を含む）は、BSD 3-Clause License の条項に従って自由に行っていただけます。

---

## 🛠️ ローカルでのビルド方法 (Docker)

本チュートリアルのビルド環境（Idris 2, pack, katla, Raku, mdBook 等）は、GitHub Packages (`ghcr.io`) で公開されている Docker コンテナに含まれています。Docker がインストールされていれば、ローカル環境を汚さずに 1 コマンドでビルドやプレビューが可能です。

### 1. 本のビルド

プロジェクトのルートディレクトリで以下を実行します:

```sh
docker run --rm \
  -v "$(pwd)":/work \
  -w /work \
  ghcr.io/narumincho/idris2-tutorial-japanese:latest \
  sh -c "pack build && ./scripts/build-book"
```

ビルドが完了すると、`book/` ディレクトリに HTML が出力されます。

### 2. ローカルサーバーでのプレビュー

ビルドと同時にローカルプレビューサーバーを起動することもできます:

```sh
docker run --rm -it \
  -v "$(pwd)":/work \
  -w /work \
  -p 3000:3000 \
  ghcr.io/narumincho/idris2-tutorial-japanese:latest \
  sh -c "pack build && ./scripts/build-book && mdbook serve -n 0.0.0.0"
```

ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスすると、プレビューを閲覧できます。


