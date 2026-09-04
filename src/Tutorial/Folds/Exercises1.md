# 再帰と畳み込み 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Folds/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Folds/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

本節の練習問題では、いくつかの再帰関数を実装します。可能な限り末尾再帰を使用し、REPL で正しく動作するか確認してください。

1. リスト内のいずれかの要素（`allList` の場合はすべての要素）が与えられた述語を満たす場合に `True` を返す関数 `anyList` と `allList` を実装してください：

   ```idris
   anyList : (a -> Bool) -> List a -> Bool

   allList : (a -> Bool) -> List a -> Bool
   ```

2. 与えられた述語を満たす最初の値（存在する場合）を返す関数 `findList` を実装してください：

   ```idris
   findList : (a -> Bool) -> List a -> Maybe a
   ```

3. 与えられた関数が `Just` を返す最初の値（存在する場合）を返す関数 `collectList` を実装してください：

   ```idris
   collectList : (a -> Maybe b) -> List a -> Maybe b
   ```

   `collectList` を使って `lookupList` を実装してください：

   ```idris
   lookupList : Eq a => a -> List (a,b) -> Maybe b
   ```

4. `map` や `filter` のように、要素の順序を変えずにリストを走査しなければならない関数の場合、末尾再帰での実装は少し難しくなります。最も安全な方法は、`SnocList`（リストを末尾から先頭ではなく、先頭から末尾に向かって構築する逆向きリスト）を使って中間結果を蓄積することです。その2つのコンストラクタは `Lin` と `(:<)`（*snoc* 演算子）です。`Data.SnocList` モジュールは、`SnocList` と `List` の相互変換を行う2つの末尾再帰演算子 *fish* と *chips*（`(<><)` と `(<>>)`）をエクスポートしています。

   `SnocList` を使ってマッピング結果を蓄積し、最後に *chips* 演算子（`(<>>)`）と `Nil` 引数を使って `SnocList` を `List` に戻す、末尾再帰版の `map`（`mapTR`）を実装してください：

   ```idris
   mapTR : (a -> b) -> List a -> List b
   ```

5. 指定された述語を満たす要素のみを残す、末尾再帰版の `filter`（`filterTR`）を実装してください。練習問題 4 と同じテクニックを使用します。

   ```idris
   filterTR : (a -> Bool) -> List a -> List a
   ```

6. 指定された関数が `Just` を返す要素のみを変換・抽出する、末尾再帰版の `mapMaybe`（`mapMaybeTR`）を実装してください：

   ```idris
   mapMaybeTR : (a -> Maybe b) -> List a -> List b
   ```

   `mapMaybeTR` を使って `catMaybesTR` を実装してください：

   ```idris
   catMaybesTR : List (Maybe a) -> List a
   ```

7. 末尾再帰版のリスト連結関数 `concatTR` を実装してください：

   ```idris
   concatTR : List a -> List a -> List a
   ```

8. `List` に対する末尾再帰版の *bind*（`bindTR`）および `join`（`joinTR`）を実装してください：

   ```idris
   bindTR : List a -> (a -> List b) -> List b

   joinTR : List (List a) -> List a
   ```

