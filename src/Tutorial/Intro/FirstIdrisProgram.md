# 最初の Idris プログラム

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Intro/FirstIdrisProgram.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Intro/FirstIdrisProgram.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Intro.FirstIdrisProgram
```

Idris 言語の一部を試したり、ドキュメントを読んだり、モジュールの内容を確認したりするのには REPL を使うことが多いですが、まずは言語の第一歩として最小限の Idris プログラムを書いてみましょう。

プログラミング学習の定番である *Hello World* です：

```idris
main : IO ()
main = putStrLn "Hello World!"
```

上記のコードの詳細は後ほど詳しく説明しますが、まずはこれをコンパイルして実行してみましょう。本書のソースコードをチェックアウトしている場合は、ルートディレクトリから以下を実行します：

```sh
pack -o hello exec src/Tutorial/Intro/FirstIdrisProgram.md
```

これにより `build/exec` ディレクトリ内に `hello` という実行可能ファイルが作成されます。以下のようにコマンドラインから実行できます（`$` 記号はターミナルコマンドと出力を区別するための表記なので入力不要です）：

```sh
$ build/exec/hello
Hello World!
```

`pack` プログラムは、使用するソースディレクトリ（本書の場合は `src`）などの設定を提供する `.ipkg` ファイルがスコープ内（カレントディレクトリまたはその親ディレクトリ）に存在することを前提としています。オプションの `-o` は生成する実行可能ファイルの名前を指定します（省略した場合は pack が自動的に名前を決定します）。利用可能なコマンドラインオプションとコマンドの一覧は `pack help` で確認でき、特定のコマンドのヘルプは `pack help <cmd>` で確認できます。

また、このソースファイルを REPL セッションに読み込んで、そこから `main` 関数を実行することもできます：

```sh
pack repl src/Tutorial/Intro/FirstIdrisProgram.md
```

```repl
Tutorial.Intro> :exec main
Hello World!
```

ぜひ両方の方法で `main` をビルド・実行してみてください！

<!-- vi: filetype=idris2:syntax=markdown
-->
