# 述語と証明探索 練習問題 パート1

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

この練習問題では、関数の引数として受け入れられる値を制約するために、自動暗黙引数（auto implicits）を利用するいくつかの関数を実装します。結果は *純粋（pure）* でなければなりません。つまり、`Maybe` のような失敗を表す型でラップしないでください。

1. リストに対する `tail` を実装してください。

2. リストに対する `concat1` と `foldMap1` を実装してください。これらは `concat` や `foldMap` と同様に動作するべきですが、要素型には `Semigroup` 制約のみを要求するようにしてください。

3. リスト内の最大要素および最小要素を返す関数を実装してください。

4. 狭義の正の自然数（1以上）に対する述語を定義し、それを使って自然数に対する安全で全域性が証明可能な除算関数を実装してください。

5. 空でない `Maybe`（値が存在すること）に対する述語を定義し、それを使って `Just` に格納された値を安全に取り出してください。また、対応する変換関数を実装することで、この述語が決定可能（decidable）であることを示してください。

6. 適切な述語を使用して、`Left` および `Right` から値を安全に取り出す関数を定義・実装してください。さらに、これらの述語が決定可能であることも示してください。

これらの練習問題で実装した述語は、*base* ライブラリですでに提供されています: `Data.List.NonEmpty`、`Data.Maybe.IsJust`、`Data.Either.IsLeft`、`Data.Either.IsRight`、`Data.Nat.IsSucc`。
