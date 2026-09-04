# 困ったときのヘルプ・質問先

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Intro/WhereToGetHelp.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Intro/WhereToGetHelp.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

Idris プログラミング言語に関するヘルプやドキュメントを入手できるリソースが、オンラインや書籍としていくつか提供されています。以下はその主な一覧です：

- [Type-Driven Development with Idris](https://www.manning.com/books/type-driven-development-with-idris)
  Idris の決定版とも言える書籍です！Idris と依存型を使用して堅牢かつ簡潔なコードを記述するためのコアコンセプトが詳しく説明されています。Idris 1 をベースに書かれているため、Idris 2 で使用する際は一部調整が必要です。[必要な変更点の一覧](https://idris2.readthedocs.io/en/latest/typedd/typedd.html) も公開されています。

- [A Crash Course in Idris 2](https://idris2.readthedocs.io/en/latest/tutorial/index.html)
  公式の Idris 2 チュートリアルです。Idris 2 の全機能が網羅的かつコンパクトに解説されています。リファレンスとして非常に有用ですが、関数型プログラミングや型駆動開発全般の入門書という構成ではありません。

- [Idris 2 GitHub リポジトリ](https://github.com/idris-lang/Idris2)
  詳細なインストール手順や入門資料が掲載されています。[Wiki](https://github.com/idris-lang/Idris2/wiki) には、[エディタプラグイン一覧](https://github.com/idris-lang/Idris2/wiki/Editor-Support) や [外部バックエンド一覧](https://github.com/idris-lang/Idris2/wiki/External-backends) などの有用な情報がまとまっています。

- [pack データベース](https://github.com/stefan-hoeck/idris2-pack-db/blob/main/STATUS.md)
  [pack](https://github.com/stefan-hoeck/idris2-pack) のコレクションに含まれる全ライブラリの一覧です。コミュニティによって寄贈された Idris 2 ライブラリの最も網羅的なリストです。

- [Idris 2 Discord サーバー](https://discord.gg/UX68fDs2jc)
  コードで行き詰まったとき、言語の機能について質問したいとき、新しいライブラリを宣伝したいとき、あるいは他の Idris プログラマーと交流したいときはここを訪れてみてください。非常に活発で、初心者にもとても親切なコミュニティです。

- Idris REPL
  Idris 自体からも多くの有用な情報を得ることができます。多くの開発者は Idris プロジェクトの作業中に少なくとも1つの REPL を常に起動しています。また、テキストエディタで [Idris 2 向け Language Server (LSP)](https://github.com/idris-community/idris2-lsp) を使用する設定も非常に便利です。REPL では以下のようなコマンドが使用できます：
  - `:t` : 式やメタ変数（ホール）の型を確認（例: `:t foldl`）
  - `:ti` : 暗黙引数を含む関数の型を確認（例: `:ti foldl`）
  - `:m` : スコープ内にあるすべてのメタ変数（ホール）を一覧表示
  - `:doc` : トップレベル関数（`:doc the`）、データ型とすべてのコンストラクタ（`:doc Bool`）、言語機能（`:doc case`, `:doc let`, `:doc interface`, `:doc record`, `:doc ?` など）、インターフェース（`:doc Uninhabited`）のドキュメントを表示
  - `:module` : 利用可能なパッケージからモジュールをインポート（例: `:module Data.Vect`）
  - `:browse` : 読み込んだモジュールが公開している全関数の名前と型を一覧表示（例: `:browse Data.Vect`）
  - `:help` : その他利用可能なコマンドとその簡単な説明を一覧表示

