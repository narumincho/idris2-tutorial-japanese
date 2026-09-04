# IO 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. 前述の例で見たように、ファイルハンドルを操作する `IO` アクションには失敗のリスクが常に伴います。そこで、いくつかのユーティリティ関数とカスタム *bind* 演算子を作成して、これらのネストしたエフェクトを簡潔に扱えるようにしましょう。新しい名前空間 `IOErr` 内で以下のユーティリティ関数を実装し、それらを使って `countEmpty'` の実装をさらに整理してください：

   ```idris
   pure : a -> IO (Either e a)

   fail : e -> IO (Either e a)

   lift : IO a -> IO (Either e a)

   catch : IO (Either e1 a) -> (e1 -> IO (Either e2 a)) -> IO (Either e2 a)

   (>>=) : IO (Either e a) -> (a -> IO (Either e b)) -> IO (Either e b)

   (>>) : IO (Either e ()) -> Lazy (IO (Either e a)) -> IO (Either e a)
   ```

2. ファイル内の単語数をカウントする関数 `countWords` を作成してください。実装には `Data.String.words` および練習問題 1 のユーティリティを使用することを検討してください。

3. ファイルの各行を反復処理しながら状態を蓄積するヘルパー関数を実装することで、`countEmpty` や `countWords` で使用した機能を一般化できます。`withLines` を実装し、それを使って `countEmpty` と `countWords` を再実装してください：

   ```idris
   covering
   withLines :  (path : String)
             -> (accum : s -> String -> s)
             -> (initialState : s)
             -> IO (Either FileError s)
   ```

4. 値の蓄積には `Monoid` がよく使われます。したがって、このケースのために `withLines` を特化させると便利です。`withLines` を使用して、以下の型を持つ `foldLines` を実装してください：

   ```idris
   covering
   foldLines :  Monoid s
             => (path : String)
             -> (f    : String -> s)
             -> IO (Either FileError s)
   ```

5. テキストドキュメント内の行数、単語数、文字数をカウントする関数 `wordCount` を実装してください。これらの値を保持・蓄積するための専用レコード型と `Monoid` 実装を定義し、`wordCount` の実装内で `foldLines` を使用してください。

