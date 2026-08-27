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

## 🛠️ 依存関係とビルド方法

本チュートリアルのビルドでは、Idris コードのシンタックスハイライトを行うために [katla](https://github.com/idris-community/katla) を使用し、Raku スクリプト（[scripts/build-book](scripts/build-book)）を介して [mdBook](https://rust-lang.github.io/mdBook/) 用のファイルを生成しています。

### 必要な依存関係

1. **Idris 2 & pack**:
   - [pack](https://github.com/stefan-hoeck/idris2-pack) のセットアップ後、katla をインストールします:
     ```sh
     pack install-app katla
     ```

2. **Raku & zef**:
   - [Raku](https://rakudo.org/) および [zef](https://github.com/ugexe/zef) をインストール後、必要なモジュールをインストールします:
     ```sh
     zef install File::Temp Shell::Command paths
     ```

3. **mdBook**:
   - Rust の [cargo](https://rustup.rs/) を使用してインストールします:
     ```sh
     cargo install mdbook
     ```

### ビルド手順

1. まず Idris コードをビルドします（シンタックスハイライト情報の生成に必要です）:
   ```sh
   pack build
   ```

2. チュートリアル本をビルドします:
   ```sh
   ./scripts/build-book
   ```

3. ビルドされた HTML は `book/` ディレクトリに出力されます。ローカルサーバーを起動して確認できます:
   ```sh
   python3 -m http.server -d book 8000
   ```

