# 述語と証明探索 おわりに (Conclusion)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Predicates/Conclusion.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Predicates/Conclusion.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

述語（Predicate）を用いることで、型どうしの契約を記述し、有効な関数引数として受け入れる値を精緻化（refine）することができます。また、これらを自動暗黙引数（auto implicit arguments）として活用することで、関数の引数の構造に関する十分な情報がある場合に Idris に自動で証明を構築させ、実行時 *および* コンパイル時の両方において安全かつ使い勝手の良い関数を実現できます。

