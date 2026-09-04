# IO: 副作用を扱うプログラミング

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

これまで扱ってきたすべての例や練習問題は、純粋で全域的な関数ばかりでした。ファイルからの読み書きや標準出力へのメッセージの表示などは行っていません。本章では、Idris で副作用（エフェクト）を伴うプログラムをどのように記述するかを学びます。

```idris hide
module Tutorial.IO

%default total
```

<!-- vi: filetype=idris2:syntax=markdown
-->
