# 述語と証明探索 練習問題 パート3

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

1. `Union` に対する以下のユーティリティ関数を実装してください：

   ```idris
   project : (0 t : Type) -> (prf : Has t ts) => Union ts -> Maybe t

   project1 : Union [t] -> t

   safe : Err [] a -> a
   ```

2. オープンユニオンをより大きな選択肢の集合へ埋め込む（embed）ための、以下の 2 つの関数を実装してください。`extend` における消去されない暗黙引数に注意してください！

   ```idris
   weaken : Union ts -> Union (ts ++ ss)

   extend : {m : _} -> {0 pre : Vect m _} -> Union ts -> Union (pre ++ ts)
   ```

3. `Union ts` を `Union ss` に埋め込む一般的な方法を見つけ、以下のようなコードが書けるようにしてください：

   ```idris
   embedTest :  Err [NoNat,NoColType] a
             -> Err [FileError, NoColType, OutOfBounds, NoNat] a
   embedTest = mapFst embed
   ```

4. 対象のエラーをハンドラが `f (Err rem a)` に変換できるようにすることで、`handle` 関数をより強力に改良してください。

