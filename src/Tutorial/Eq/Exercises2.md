# 命題的等値性 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

本節の練習問題では、関数の性質に関する簡単な証明を実装します。ホールを活用しながら進めてください。

1. `Either e` に対する `map Prelude.id` が値を変更しないことを証明してください。

2. リストに対する `map Prelude.id` がリストを変更しないことを証明してください。

3. 前章の核酸において、相補鎖の相補鎖（2 回の `complement`）が元の鎖に戻ることを証明してください。

   ヒント: まず単一の塩基について証明し、核酸配列に対する証明では *Prelude* の `cong2` を利用してください。

4. `replaceVect` を実装してください：

   ```idris
   replaceVect : (ix : Fin n) -> a -> Vect n a -> Vect n a
   ```

   `replaceVect` で要素を置換した直後に同じインデックスを `index` で取得すると、置換した値が得られることを証明してください。

5. `insertVect` を実装してください：

   ```idris
   insertVect : (ix : Fin (S n)) -> a -> Vect n a -> Vect (S n) a
   ```

   挿入した要素が正しく取得できることを同様に証明してください。

