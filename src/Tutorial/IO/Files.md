# ファイル操作 (Working with Files)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/Files.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/Files.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.IO.Files

import Data.List1
import Data.String
import Data.Vect

import System.File

%default total
```

*base* ライブラリの `System.File` モジュールは、ファイルハンドルを操作してファイルへの読み書きを行うためのユーティリティをエクスポートしています。ファイルパス（例: `"/home/hock/idris/tutorial/tutorial.ipkg"`）がある場合、最初に行うのは通常、`openFile` を呼び出してファイルハンドル（`System.File.File` 型）の取得を試みることです。

以下は、Unix/Linux ファイル内の空行の数を数えるプログラムです：

```idris
covering
countEmpty : (path : String) -> IO (Either FileError Nat)
countEmpty path = openFile path Read >>= either (pure . Left) (go 0)
  where covering go : Nat -> File -> IO (Either FileError Nat)
        go k file = do
          False <- fEOF file | True => closeFile file $> Right k
          Right "\n" <- fGetLine file
            | Right _  => go k file
            | Left err => closeFile file $> Left err
          go (k + 1) file
```

上の例では、*do ブロック* を開始せずに直接 `(>>=)` を呼び出しています。何が起きているかを確認してください。他の人のコードを理解するためには、簡潔な関数型コードを読む力が必要です。REPL で `either` 関数の型を確認し、`(pure . Left)` が何を行っているかを把握し、カリー化された `go` が `either` の第2引数としてどのように渡されているかに注目してください。

関数 `go` についてもいくつか解説が必要です。まず、`let` 束縛で見たのと同様の中間結果に対するパターンマッチ構文をここでも使用しています。縦線 `|` を使って複数のパターンを処理できます。ファイルから1行読み取るには `fGetLine` 関数を使用します。ファイルシステムを扱うほとんどの操作と同様に、この関数も `FileError` で失敗する可能性があり、適切に処理する必要があります。また、`fGetLine` は末尾の改行文字 `'\n'` を含んだ行を返すため、空行を判定するには空文字列 `""` ではなく `"\n"` とマッチさせる必要があります。

最後に、`go` は全域性が証明できず、`covering` が付けられています。`/dev/urandom` や `/dev/zero` などのファイルは無限のデータストリームを提供するため、そのようなパスで呼び出された場合、`countEmpty` は決して終了しないためです。

## 安全なリソース管理 (Safe Resource Handling)

`countEmpty` では、ファイルハンドルを手動でオープンおよびクローズしなければならなかった点に注目してください。これはエラーを起こしやすく煩雑です。リソース管理は大きなトピックであり、ここでは詳細には踏み込みませんが、`System.File` は便利な関数 `withFile` をエクスポートしています。これはファイルのオープン、クローズ、およびエラーハンドリングを自動的に処理してくれます。

```idris
covering
countEmpty' : (path : String) -> IO (Either FileError Nat)
countEmpty' path = withFile path Read pure (go 0)
  where covering go : Nat -> File -> IO (Either FileError Nat)
        go k file = do
          False <- fEOF file | True => pure (Right k)
          Right "\n" <- fGetLine file
            | Right _  => go k file
            | Left err => pure (Left err)
          go (k + 1) file
```

`withFile` の型を REPL で確認し、それを使って `countEmpty'` の実装がどのようにシンプルになったかを確認してみてください。少し複雑な関数の型を読んで理解することは、Idris でのプログラミングを学ぶ上で重要です。

### `HasIO` インターフェース

ここまで使用してきた `IO` 関数を見ると、そのほとんどが `IO` 自体を直接扱うのではなく、`HasIO` 制約を持つ型パラメータ `io` を受け取っていることに気づくでしょう。このインターフェースは、`IO a` 型の値を別のコンテキストに **持ち上げる（lift する）** ことを可能にします。これについては後の章（特にモナド変換子を扱う際）でユースケースが登場します。現時点では、これらの `io` パラメータは `IO` に特化されているものとして扱って構いません。

<!-- vi: filetype=idris2:syntax=markdown
-->
