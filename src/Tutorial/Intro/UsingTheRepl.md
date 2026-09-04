# REPL の使い方

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Intro/UsingTheRepl.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Intro/UsingTheRepl.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

Idris には REPL（*Read-Eval-Print Loop*、対話型評価環境）が付属しており、ちょっとしたアイデアを試したり、書いたばかりのコードを手早く実験したりするのに便利です。REPL セッションを開始するには、ターミナルで以下のコマンドを実行します：

```sh
pack repl
```

これで Idris はコマンドを受け付ける準備が整います：

```repl
     ____    __     _         ___
    /  _/___/ /____(_)____   |__ \
    / // __  / ___/ / ___/   __/ /     Version 0.5.1-3c532ea35
  _/ // /_/ / /  / (__  )   / __/      https://www.idris-lang.org
 /___/\__,_/_/  /_/____/   /____/      Type :? for help

Welcome to Idris 2.  Enjoy yourself!
Main>
```

簡単な算術式を入力すると、Idris がそれを **評価 (evaluate)** して結果を出力します：

```repl
Main> 2 * 4
8
Main> 3 * (7 + 100)
321
```

Idris ではすべての式が **型 (type)** を持っているため、型を確認することもできます：

```repl
Main> :t 2
2 : Integer
```

`:t` は Idris REPL 専用のコマンドであり（Idris プログラミング言語自体の構文ではありません）、式の型を調べるために使用します：

```repl
Main> :t 2 * 4
2 * 4 : Integer
```

型を明示せずに整数リテラルを含む計算を行う場合、Idris はデフォルトで `Integer` 型を仮定します。`Integer` は、ハードコードされた上限値のない **任意精度 (arbitrary precision)** の符号付き整数型です。これは言語に組み込まれている **プリミティブ型 (primitive types)** の1つです。その他のプリミティブ型には、固定精度の符号付き・符号なし整数型（`Bits8`, `Bits16`, `Bits32`, `Bits64`, `Int8`, `Int16`, `Int32`, `Int64`）、倍精度 (64ビット) 浮動小数点数（`Double`）、Unicode文字（`Char`）、Unicode文字列（`String`）などがあります。

