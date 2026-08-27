# インターフェース

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

関数のオーバーロード（同じ名前でありながら異なる実装を持つ関数の定義）は、多くのプログラミング言語に見られる概念です。Idris は関数のオーバーロードをネイティブにサポートしています。異なるモジュールや名前空間で同名の2つの関数を定義でき、Idris は関連する型に基づいてそれらの曖昧さを解消しようと試みます。以下に例を示します：

```idris
module Tutorial.Interfaces

%default total

namespace Bool
  export
  size : Bool -> Integer
  size True  = 1
  size False = 0

namespace Integer
  export
  size : Integer -> Integer
  size = id

namespace List
  export
  size : List a -> Integer
  size = cast . length
```

ここでは、それぞれ独自の名前空間に `size` という名前の3つの異なる関数を定義しました。名前空間をプレフィックスとして付けることで、これらを明示的に区別できます：

```repl
Tutorial.Interfaces> :t Bool.size
Tutorial.Interfaces.Bool.size : Bool -> Integer
```

しかし、通常はその必要はありません：

```idris
mean : List Integer -> Integer
mean xs = sum xs `div` size xs
```

このように、`xs` の型が `List Integer` であり、これは `List.size` の引数の型 `List a` にのみ単一化（ユニフィケーション）されるため、Idris は異なる `size` 関数の曖昧さを自動的に解消できます。

<!-- vi: filetype=idris2:syntax=markdown
-->
