# 代数的データ型

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

前章では、独自の関数を記述し、それらを組み合わせてより複雑な機能を作り出す方法について学びました。それと同様に重要なのが、独自のデータ型を定義し、それらを関数の引数や戻り値として利用できるようにすることです。

本章は情報量が多く、読みごたえのある章となっています。関数型プログラミングの経験があれば馴染みのある内容も多いかもしれませんが、初めて学ぶ場合は焦らずゆっくり読み進め、例を実際に動かしたり、自分でも例を考えて試してみたりすることをお勧めします。概念をしっかり理解するために、必要に応じて練習問題にも取り組んでみてください。

```idris hide
module Tutorial.DataTypes
```

<!-- vi: filetype=idris2:syntax=markdown
-->
