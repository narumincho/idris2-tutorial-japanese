# 関数入門

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions1.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

Idris は **関数型** プログラミング言語であり、関数が主な抽象化の手段です（Java のようなオブジェクト指向言語において「オブジェクト」や「クラス」が主な抽象化手段であるのとは対照的です）。したがって、Idris では関数を合成・組み合わせて新しい関数を作成することが極めて容易になっています。実際、Idris では関数は **第一級 (first-class)** の値であり、他の関数を引数として受け取ったり、結果として関数を返したりすることができます。

本章では、関数を組み合わせたり生成したりするために Idris が提供する基本的なツールについて探っていきます。

```idris hide
module Tutorial.Functions1
```

<!-- vi: filetype=idris2:syntax=markdown
-->
