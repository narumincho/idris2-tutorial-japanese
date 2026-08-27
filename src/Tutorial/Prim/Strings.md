# 文字列の操作 (Working with Strings)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Strings.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Strings.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Prim.Strings

import Data.Bits
import Data.String

%default total
```

*base* の `Data.String` モジュールには、文字列を操作するための豊富な関数が用意されています。これらはすべて、コンパイラ組み込みの以下のプリミティブ操作に基づいています：

- `prim__strLength`: 文字列の長さを返します。
- `prim__strHead`: 文字列の先頭文字を抽出します。
- `prim__strTail`: 文字列から先頭文字を取り除いた残りを返します。
- `prim__strCons`: 文字を文字列の先頭に追加します。
- `prim__strAppend`: 2 つの文字列を連結します。
- `prim__strIndex`: 文字列の指定位置にある文字を抽出します。
- `prim__strSubstr`: 指定された位置の間の部分文字列を抽出します。

言うまでもなく、これらの関数のすべてが全域（total）であるわけではありません。そのため、無効な呼び出しがコンパイル時に簡約（reduce）されないように Idris は制御しています（そうしないとコンパイラ自体がクラッシュしてしまうためです）。しかし、対応するプログラムをコンパイルして実行し、部分プリミティブ関数の評価を強制した場合、プログラムは実行時エラーでクラッシュします：

```repl
Tutorial.Prim> prim__strTail ""
prim__strTail ""
Tutorial.Prim> :exec putStrLn (prim__strTail "")
Exception in substring: 1 and 0 are not valid start/end indices for ""
```

`prim__strTail ""` が REPL では簡約されず、プログラムをコンパイルして実行すると実行時例外になる点に注目してください。一方、有効な `prim__strTail` の呼び出しは問題なく簡約されます：

```idris
tailExample : prim__strTail "foo" = "oo"
tailExample = Refl
```

## Pack と Unpack (Pack and Unpack)

文字列を扱う上で最も重要な関数の 2 つが `unpack` と `pack` です。これらは文字列を文字のリストに変換し、またその逆を行います。これにより、文字のリストに対する反復処理や畳み込み（fold）を用いて、多くの文字列操作を簡潔に実装できます。これは常に最も効率的であるとは限りませんが、非常に膨大なテキストを処理するのでない限り、十分に高速に機能します。

## 文字列展開・埋め込み (String Interpolation)

Idris では、波括弧（開き括弧の前にバックスラッシュをエスケープとして付ける）で囲むことで、文字列リテラルの中に任意の文字列表現を埋め込むことができます。例えば：

```idris
interpEx1 : Bits64 -> Bits64 -> String
interpEx1 x y = "\{show x} + \{show y} = \{show $ x + y}"
```

これは、異なる型の値から複雑な文字列を組み立てる非常に便利な方法です。さらに、`Interpolation` インターフェースを利用すると、事前に文字列へ明示的に変換することなく、埋め込み文字列の中で値を直接使用できるようになります：

```idris
data Element = H | He | C | N | O | F | Ne

Formula : Type
Formula = List (Element,Nat)

Interpolation Element where
  interpolate H  = "H"
  interpolate He = "He"
  interpolate C  = "C"
  interpolate N  = "N"
  interpolate O  = "O"
  interpolate F  = "F"
  interpolate Ne = "Ne"

Interpolation (Element,Nat) where
  interpolate (_, 0) = ""
  interpolate (x, 1) = "\{x}"
  interpolate (x, k) = "\{x}\{show k}"

Interpolation Formula where
  interpolate = foldMap interpolate

ethanol : String
ethanol = "The formulat of ethanol is: \{[(C,2),(H,6),(O, the Nat 1)]}"
```

## Raw 文字列と複数行文字列リテラル (Raw and Multiline String Literals)

通常の文字列リテラルでは、引用符やバックスラッシュ、改行文字などの特定の文字をエスケープする必要があります。例えば：

```idris
escapeExample : String
escapeExample = "A quote: \". \nThis is on a new line.\nA backslash: \\"
```

Idris では、囲む引用符の前後に同じ数のハッシュ記号（`#`）を付けることで、引用符やバックスラッシュをエスケープする必要のない **Raw 文字列リテラル（raw string literals）** を記述できます。例えば：

```idris
rawExample : String
rawExample = #"A quote: ". A blackslash: \"#

rawExample2 : String
rawExample2 = ##"A quote: ". A blackslash: \"##
```

Raw 文字列リテラルでも文字列展開（インターポレーション）を使用できますが、開き波括弧の前にバックスラッシュと、文字列リテラルの開始・終了に使われているのと同じ数のハッシュ記号をプレフィックスとして付ける必要があります：

```idris
rawInterpolExample : String
rawInterpolExample = ##"An interpolated "string": \##{rawExample}"##
```

最後に、Idris では複数行文字列（multiline strings）も便利に記述できます。これらも Raw 複数行文字列リテラルにしたい場合はハッシュ記号を前後に付けることができ、文字列展開と組み合わせることも可能です。複数行リテラルは 3 つの引用符（`"""`）で開始および終了します。終了の三重引用符をインデントすることで、複数行リテラル全体をインデントできます。インデントに使用された空白は結果の文字列には含まれません。例えば：

```idris
multiline1 : String
multiline1 = """
  And I raise my head and stare
  Into the eyes of a stranger
  I've always known that the mirror never lies
  People always turn away
  From the eyes of a stranger
  Afraid to see what hides behind the stare
  """

multiline2 : String
multiline2 = #"""
  An example for a simple expression:
  "foo" ++ "bar".
  This is reduced to "\#{"foo" ++ "bar"}".
  """#
```

REPL でこれらの例の文字列を確認し、文字列展開や Raw 文字列リテラルの効果を構文と比較してみてください。

<!-- vi: filetype=idris2:syntax=markdown
-->
