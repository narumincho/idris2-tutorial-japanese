# プリミティブ 練習問題 パート2

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

1. 整数値に対するラッパーレコードを定義し、`(<+>)` が `(.&.)`（ビット積 / AND）に対応するように `Monoid` を実装してください。

   ヒント: 単位元として適切な値を見つけるために、`Bits` インターフェースで利用可能な関数を確認してください。

2. 整数値に対するラッパーレコードを定義し、`(<+>)` が `(.|.)`（ビット和 / OR）に対応するように `Monoid` を実装してください。

3. ビット演算を使用して、与えられた `Bits64` 型の値が偶数であるかどうかを判定する関数を実装してください。

4. `Bits64` 型の値を 2 進数表現の文字列に変換してください。

5. `Bits64` 型の値を 16 進数表現の文字列に変換してください。

   ヒント: 連続する 4 ビットの塊にアクセスするために、`shiftR` と `(.&. 15)` を使用してください。

