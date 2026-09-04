# IO 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

本節の練習問題では、いくつかの小さなコマンドラインアプリケーションを実装します。その中には、ユーザーが終了キーワードを入力するまで潜在的に永遠に実行され続けるものがあります。そのようなプログラムは全域性を証明できません。ソースファイルの冒頭に `%default total` プラグマを追加している場合、これらの関数には `covering` アノテーションを付与する必要があります。これは「すべてのパターンマッチで全ケースを網羅（カバー）しているが、無制限の再帰によりプログラムが無限ループする可能性がある」ことを意味します。

1. 端末から1行の入力を読み取り、与えられた関数で評価し、結果を標準出力に表示する関数 `rep` を実装してください：

   ```idris
   rep : (String -> String) -> IO ()
   ```

2. `rep` と同様に動作するものの、永遠に（または強制終了されるまで）処理を繰り返す関数 `repl` を実装してください：

   ```idris
   covering
   repl : (String -> String) -> IO ()
   ```

3. `repl` と同様に動作するものの、指定された関数が `Right` を返す間だけループを継続する関数 `replTill` を実装してください。`Left` が返された場合、`replTill` は `Left` にラップされた最後のメッセージを出力して終了するようにします。

   ```idris
   covering
   replTill : (String -> Either String String) -> IO ()
   ```

4. 標準入力から算術式を読み取り、`eval` を使って評価し、結果を標準出力に表示するプログラムを作成してください。このプログラムは、ユーザーが「done」と入力して停止するまでループし、「done」が入力された場合は親切な挨拶を表示して終了するようにします。実装には `replTill` を使用してください。

5. `repl` と同様に動作するものの、内部状態を使用して値を蓄積（アキュムレート）する関数 `replWith` を実装してください。各反復（最初の1回目を含む！）において、`dispState` 関数を使用して現在の状態を標準出力に表示し、`next` 関数を使用して次の状態を計算します。`Left` が返された場合はループを終了し、`dispResult` を使って最終メッセージを出力します：

   ```idris
   covering
   replWith :  (state      : s)
            -> (next       : s -> String -> Either res s)
            -> (dispState  : s -> String)
            -> (dispResult : res -> s -> String)
            -> IO ()
   ```

6. 練習問題 5 の `replWith` を使用して、標準入力から自然数を読み取り、それらの累積合計を出力するプログラムを作成してください。このプログラムは、無効な入力があった場合、およびユーザーが「done」と入力した場合に終了するようにします。

