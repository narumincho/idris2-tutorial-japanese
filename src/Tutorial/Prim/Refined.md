# 洗練されたプリミティブ (Refined Primitives)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Refined.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Refined.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Prim.Refined

import Data.Bits
import Data.String

%default total
```

特定のコンテキストにおいて、ある型のすべての値を許可したくないことがよくあります。例えば、UTF-8 文字の任意のシーケンス（その中には印字不能な文字も含まれます）としての `String` は、多くの場面で汎用が過ぎます。したがって、値を消去される妥当性の証明とペアにすることで、無効な値を早期に排除することが通常望ましいです。

これまで、関数が全域であることを証明し、理想的には関連する他の述語を導出できるようなエレガントな述語の書き方を学んできました。しかし、プリミティブに対する述語を定義する場合、述語を操作できる一連のプリミティブ公理（おそらく `believe_me` を使って実装される）を用意しない限り、ある程度孤立した状態にならざるを得ません。

## ユースケース: ASCII 文字列 (ASCII Strings)

文字エンコーディングは複雑なトピックであるため、多くの低レベルルーチンでは最初から大半の文字を排除しておくことが理にかなっています。そこで、アプリケーションで受け入れる文字列が ASCII 文字のみで構成されていることを保証したいとしましょう：

```idris
isAsciiChar : Char -> Bool
isAsciiChar c = ord c <= 127

isAsciiString : String -> Bool
isAsciiString = all isAsciiChar . unpack
```

これで、文字列値を消去される妥当性の証明とペアにすることで **洗練（refine）** できます：

```idris
record Ascii where
  constructor MkAscii
  value : String
  0 prf : isAsciiString value === True
```

これで、ラップされた文字列を事前に検証することなく、実行時またはコンパイル時に `Ascii` 型の値を作成することは **不可能** になりました。これにより、コンパイル時に文字列を安全に `Ascii` 型の値にラップすることがすでに非常に簡単になります：

```idris
hello : Ascii
hello = MkAscii "Hello World!" Refl
```

しかし、安全性の恩恵を犠牲にすることなく、文字列リテラルをそのまま使えた方がはるかに便利です。そのためには `FromString` インターフェースを使うことはできません。その関数 `fromString` は、無効な文字列であっても *任意の* 文字列を変換することを強制してしまうためです。

しかし実際には、整数リテラルをサポートするために `Num` の実装が必要でなかったのと同様に、文字列リテラルをサポートするために `FromString` の実装は必須ではありません。本当に必要なのは `fromString` という名前の関数です。文字列リテラルが脱糖（糖衣構文の解除）される際、与えられた文字列値を引数とする `fromString` の呼び出しに変換されます。例えば、リテラル `"Hello"` は `fromString "Hello"` に脱糖されます。これは型チェックや（自動）暗黙値の解決の前に発生します。したがって、妥当性の証明として消去される自動暗黙引数を持つカスタムの `fromString` 関数を定義することはまったく問題ありません：

```idris
fromString : (s : String) -> {auto 0 prf : isAsciiString s === True} -> Ascii
fromString s = MkAscii s prf
```

これにより、（有効な）文字列リテラルを使って `Ascii` 型の値を直接作成できます：

```idris
hello2 : Ascii
hello2 = "Hello World!"
```

実行時に未知のソースの文字列から `Ascii` 型の値を作成するには、失敗型を返す洗練関数を使用できます：

```idris
test : (b : Bool) -> Dec (b === True)
test True  = Yes Refl
test False = No absurd

ascii : String -> Maybe Ascii
ascii x = case test (isAsciiString x) of
  Yes prf   => Just $ MkAscii x prf
  No contra => Nothing
```

### ブール値の証明の欠点 (Disadvantages of Boolean Proofs)

多くのユースケースにおいて、上記の ASCII 文字列で説明したアプローチは非常に役立ちます。しかし、このアプローチの欠点のひとつは、手元にある証明を使って安全に計算を行うことができない点です。

例えば、2 つの ASCII 文字列を連結しても問題ないことは分かっていますが、それを Idris に納得させるためには `believe_me` を使わざるを得ません。そうしないと以下の補題を証明できないからです：

```idris
0 allAppend :  (f : Char -> Bool)
            -> (s1,s2 : String)
            -> (p1 : all f (unpack s1) === True)
            -> (p2 : all f (unpack s2) === True)
            -> all f (unpack (s1 ++ s2)) === True
allAppend f s1 s2 p1 p2 = believe_me $ Refl {x = True}

namespace Ascii
  export
  (++) : Ascii -> Ascii -> Ascii
  MkAscii s1 p1 ++ MkAscii s2 p2 =
    MkAscii (s1 ++ s2) (allAppend isAsciiChar s1 s2 p1 p2)
```

与えられた文字列から部分文字列を抽出するすべての操作についても同様です。`believe_me` を使用して対応する規則を実装する必要があります。したがって、洗練されたプリミティブを便利に扱うための適切な公理のセットを見つけることは時に困難であり、そのような公理がそもそも必要かどうかは目の前のユースケースに大きく依存します。

## ユースケース: サニタイズされた HTML (Sanitized HTML)

登録ユーザー間の科学的議論のためのシンプルな Web アプリケーションを作成しているとしましょう。話を簡単にするため、ここでは未フォーマットのテキスト入力のみを考えます。ユーザーはテキストフィールドに任意のテキストを入力でき、Enter キーを押すとそのメッセージが他のすべての登録ユーザーに表示されます。

あるユーザーが以下のテキストを入力したとします：

```html
<script>alert("Hello World!")</script>
```

もっと悪質なものもあり得ましたが、これを防ぐ措置を講じない限り、意図しない JavaScript プログラムが Web ページに埋め込まれてしまう可能性があります。ここで説明したのは、[クロスサイトスクリプティング（XSS）](https://ja.wikipedia.org/wiki/%E3%82%AF%E3%83%AD%E3%82%B9%E3%82%B5%E3%82%A4%E3%83%88%E3%82%B9%E3%82%AF%E3%83%AA%E3%83%97%E3%83%86%E3%82%A3%E3%83%B3%E3%82%AC) としてよく知られているセキュリティ脆弱性です。これにより、Web ページのユーザーが悪意のある JavaScript コードをテキストフィールドに入力し、それがページの HTML 構造に含まれて他のユーザーに表示された際に実行されてしまいます。

自身の Web ページ上でこれが起こらないようにしたいと考えます。この攻撃から防御するために、例えば `'<'` や `'>'` などの特定の文字を完全に禁止することもできますが（これだけでは不十分な場合もあります）、チャットサービスがプログラマ向けである場合、これは過度に制限的です。代替案として、特定の文字をページに描画する前にエスケープする方法があります。

```idris
escape : String -> String
escape = concat . map esc . unpack
  where esc : Char -> String
        esc '<'  = "&lt;"
        esc '>'  = "&gt;"
        esc '"'  = "&quot;"
        esc '&'  = "&amp;"
        esc '\'' = "&apos;"
        esc c    = singleton c
```

ここで行いたいのは、適切にエスケープされたことの証明と一緒に文字列を保持することです。これは存在量化のもうひとつの形です。「ここに文字列があり、過去に別の文字列が存在し、それを `escape` に渡した結果、現在の文字列に到達した」。これをエンコードする方法は以下のとおりです：

```idris
record Escaped where
  constructor MkEscaped
  value    : String
  0 origin : String
  0 prf    : escape origin === value
```

未知のソースからの文字列を Web ページに埋め込む際はいつでも `Escaped` 型の値を要求するようにすれば、クロスサイトスクリプティング攻撃に対して脆弱でないという極めて強い保証が得られます。さらに素晴らしいことに、コンパイル時に既知の文字列リテラルを事前にエスケープすることなく安全に埋め込むことも可能です：

```idris
namespace Escaped
  export
  fromString : (s : String) -> {auto 0 prf : escape s === s} -> Escaped
  fromString s = MkEscaped s s prf

escaped : Escaped
escaped = "Hello World!"
```

<!-- vi: filetype=idris2:syntax=markdown
-->
