# 命題的等値性 練習問題 パート4

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Eq/Exercises4.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Eq/Exercises4.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

1. `plusSuccRightSucc` を自力で実装してください。

2. すべての自然数 `n` について `minus n n = 0` であることを証明してください。

3. すべての自然数 `n` について `minus n 0 = n` であることを証明してください。

4. すべての自然数 `n` について `n * 1 = n` および `1 * n = n` であることを証明してください。

5. 自然数の加算が交換可能（可換 / commutative）であることを証明してください。

6. ベクトルに対する末尾再帰版の `map` を実装してください。

7. 以下の命題を証明してください：

   ```idris
   mapAppend :  (f : a -> b)
             -> (xs : List a)
             -> (ys : List a)
             -> map f (xs ++ ys) = map f xs ++ map f ys
   ```

8. 練習問題 7 の証明を利用して、2 つの `Table` を zip（結合）する関数を再実装してください。今回はヘルパー関数 `appRows` の代わりに書き換え規則（`rewrite`）と `Data.HList.(++)` を使用してください。

