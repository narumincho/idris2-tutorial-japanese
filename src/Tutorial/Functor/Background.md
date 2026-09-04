# 背景と参考文献

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Background.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Background.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

*Functor（関手）* や *Monad（モナド）* といった概念は、数学の一分野である **圏論（Category Theory）** に起源を持ちます。それらの法則（モナド則など）も圏論に由来します。圏論はプログラミング言語理論、特に関数型プログラミングにおいて強力な応用を持つことが明らかになりました。極めて抽象的なトピックですが、プログラマ向けの非常にわかりやすい入門書として [Bartosz Milewski 氏による『Category Theory for Programmers』](https://bartoszmilewski.com/2014/10/28/category-theory-for-programmers-the-preface/) があります。

Functor と Monad の中間に位置する *Applicative Functor（アプリカティブ関手）* の有用性は、Haskell でモナドがすでに使われるようになってから数年後に発見されました。これは論文 [*Applicative Programming with Effects*](https://www.staff.city.ac.uk/~ross/papers/Applicative.html) で紹介され、オンラインで自由に読むことができる非常にお勧めの文献です。

