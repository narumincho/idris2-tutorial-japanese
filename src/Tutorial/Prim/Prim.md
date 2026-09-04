# プリミティブの実装方法 (How Primitives are Implemented)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Prim/Prim.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Prim/Prim.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Prim.Prim

import Data.Bits
import Data.String

%default total
```

## バックエンドに関する補足 (A Short Note on Backends)

[Wikipedia](https://ja.wikipedia.org/wiki/%E3%82%B3%E3%83%B3%E3%83%91%E3%82%A4%E3%83%A9) によると、コンパイラとは「あるプログラミング言語（ソース言語）で書かれたコンピュータプログラムを、別の言語（ターゲット言語）に変換するコンピュータプログラム」です。Idris コンパイラはまさにそれであり、Idris で書かれたプログラムを Chez Scheme で書かれたプログラムに変換するプログラムです。この Scheme コードは Chez Scheme インタプリタによってパース・解釈され実行されます（そのため、コンパイルされた Idris プログラムを実行するにはマシンに Chez Scheme がインストールされている必要があります）。

しかし、それは一面にすぎません。Idris 2 は当初からさまざまなコード生成器（いわゆる **バックエンド / backends**）をサポートするように設計されており、異なるプラットフォームをターゲットにした Idris コードを記述できます。標準の Idris インストール環境にも複数のバックエンドが用意されています。使用するバックエンドは `--cg` コマンドライン引数（`cg` は *code generator* の略）で指定できます。例えば：

```sh
idris2 --cg racket
```

以下は標準の Idris インストール環境で利用可能なバックエンドの一部です（括弧内はコマンドライン引数で指定する名前）：

- Racket Scheme (`racket`): Scheme プログラミング言語の別の方言です。OS で Chez Scheme が利用できない場合に便利です。
- Node.js (`node`): Idris プログラムを JavaScript に変換し、Node.js 上で実行します。
- Browser (`javascript`): ブラウザ上で動作する Web アプリケーションを Idris で記述するための JavaScript バックエンドです。
- RefC (`refc`): Idris を C 言語のコードにコンパイルし、それをさらに C コンパイラでコンパイルするバックエンドです。

JavaScript バックエンドについては、本書の別のパートで詳しく取り上げる予定です。

また、Idris プロジェクト公式ではサポートされていない外部バックエンドもいくつか存在し、Java や Python へコンパイルするバックエンドなどがあります。外部バックエンドの一覧は [Idris Wiki](https://github.com/idris-lang/Idris2/wiki/1-%5BLanguage%5D-External-backends) で確認できます。

## Idris のプリミティブ型 (The Idris Primitives)

**プリミティブデータ型（primitive data type）** とは、プリミティブに対する計算を実行するために使用される一連の **プリミティブ関数（primitive functions）** とともに、Idris コンパイラ内部に組み込まれている型のことです。したがって、*Prelude* のソースコードの中にプリミティブ型や関数の通常の定義を見つけることはできません。

Idris におけるプリミティブ型の一覧は以下のとおりです：

- 符号付き固定長整数:
  - `Int8`: [-128, 127] の範囲の整数
  - `Int16`: [-32768, 32767] の範囲の整数
  - `Int32`: [-2147483648, 2147483647] の範囲の整数
  - `Int64`: [-9223372036854775808, 9223372036854775807] の範囲の整数
- 符号なし固定長整数:
  - `Bits8`: [0, 255] の範囲の整数
  - `Bits16`: [0, 65535] の範囲の整数
  - `Bits32`: [0, 4294967295] の範囲の整数
  - `Bits64`: [0, 18446744073709551615] の範囲の整数
- `Integer`: 符号付き任意精度整数（多倍長整数）。
- `Double`: 倍精度（64ビット）浮動小数点数。
- `Char`: Unicode 文字。
- `String`: Unicode 文字のシーケンス（文字列）。
- `%World`: 現在の世界の状態のシンボリックな表現。`IO` の実装方法を説明した際に登場しました。普段、自分のコードでこの型の値を直接操作することはありません。
- `Int`: これは特別な型です。固定精度の符号付き整数ですが、ビットサイズは使用しているバックエンドや（場合によっては）プラットフォームに依存します。例えば、デフォルトの Chez Scheme バックエンドでは `Int` は 64 ビット符号付き整数ですが、JavaScript バックエンドではパフォーマンス上の理由から 32 ビット符号付き整数になります。そのため、`Int` の保証は非常に少なく、可能な限り上記の明確に規定された整数型のいずれかを使用することをお勧めします。

コンパイラのソースコードのどこでプリミティブ型や関数が定義されているかを知ることは勉強になります。このソースコードは [Idris プロジェクト](https://github.com/idris-lang/Idris2) の `src` フォルダにあり、プリミティブ型はデータ型 `Core.TT.Constant` の定数コンストラクタとして定義されています。

## プリミティブ関数 (Primitive Functions)

プリミティブを操作するすべての計算は、2 種類のプリミティブ関数に基づいています。コンパイラ組み込みの関数（後述）と、プログラマが外部関数インターフェース（FFI）経由で定義した関数（別の章で説明します）です。

組み込みプリミティブ関数はコンパイラが既知の関数であり、その定義は *Prelude* には見当たりません。これらはプリミティブ型に対して利用可能なコア機能を定義します。通常、これらを直接呼び出すことはなく（ほとんどの場合直接呼び出しても問題ありませんが）、*Prelude* や *base* ライブラリからエクスポートされた関数やインターフェースを経由して呼び出します。

例えば、2 つの 8 ビット符号なし整数を加算するプリミティブ関数は `prim__add_Bits8` です。REPL でその型と動作を確認できます：

```repl
Tutorial.Prim> :t prim__add_Bits8
prim__add_Bits8 : Bits8 -> Bits8 -> Bits8
Tutorial.Prim> prim__add_Bits8 12 100
112
```

`Bits8` に対する `Num` インターフェースの実装コードを見ると、プラス演算子 `(+)` が内部で `prim__add_Bits8` を呼び出しているだけであることが分かります。プリミティブのインターフェース実装にある他のほとんどの関数も同様です。例えば、`%World` を除くすべてのプリミティブ型にはプリミティブ比較関数が用意されています。`Bits8` の場合、`prim__eq_Bits8`、`prim__gt_Bits8`、`prim__lt_Bits8`、`prim__gte_Bits8`、`prim__lte_Bits8` です。これらの関数は `Bool`（これは Idris ではプリミティブ型では *ありません*）を返すのではなく、`Int` を返す点に注意してください。そのため、インターフェース `Eq` や `Comp` の演算子実装ほど安全でも使いやすくもありません。一方で、`Bool` への変換を挟まないため、パフォーマンスが極めて重要なコードではわずかに高速に動作する可能性があります（これは本格的なプロファイリングを行った後でのみ特定すべき事項です）。

プリミティブ型と同様に、プリミティブ関数はコンパイラソースのデータ型（`Core.TT.PrimFn`）のコンストラクタとして列挙されています。以降の節でこれらの多くを見ていきます。

## プリミティブであることの帰結 (Consequences of being Primitive)

プリミティブ関数やプリミティブ型は、多くの点でコンパイラにとって **不透明（opaque）** です。これらは各バックエンドによって個別に定義・実装される必要があるため、コンパイラはプリミティブ値の内部構造についても、プリミティブ関数の内部動作についても何も知りません。例えば、以下の再帰関数において、再帰呼び出しの引数が基底ケースに向かって減少していることは人間には分かりますが（使用しているバックエンドにバグがない限り）、コンパイラには分かりません：

```idris
covering
replicateBits8' : Bits8 -> a -> List a
replicateBits8' 0 _ = []
replicateBits8' n v = v :: replicateBits8' (n - 1) v
```

このような場合、単なる *covering*（網羅的）な関数で妥協するか、全域性チェッカーを納得させるために `assert_smaller` を使用します（推奨される方法）：

```idris
replicateBits8 : Bits8 -> a -> List a
replicateBits8 0 _ = []
replicateBits8 n v = v :: replicateBits8 (assert_smaller n $ n - 1) v
```

以前にも `assert_smaller` を使用するリスクをお見せしたとおり、新しい関数引数が基底ケースに関して本当に小さくなっているかについては細心の注意を払う必要があります。

Idris はプリミティブや関連関数の内部動作について何も知りませんが、コンパイル時に既知の値が与えられた場合、これらの関数の多くは評価中に簡約（reduce）されます。例えば、`Bits8` に対して以下の等式が成り立つことを自明に証明できます：

```idris
zeroBits8 : the Bits8 0 = 255 + 1
zeroBits8 = Refl
```

プリミティブの内部構造やプリミティブ関数の実装を把握していないため、Idris はそのような関数や値に関する **一般的な性質（general properties）** を証明する手助けをすることはできません。これを示す例を挙げます。リストをその長さでインデックス付けしたデータ型でラップしたいとしましょう：

```idris
data LenList : (n : Nat) -> Type -> Type where
  MkLenList : (as : List a) -> LenList (length as) a
```

2 つの `LenList` を連結する場合、長さのインデックスは加算されるべきです。これがリストの連結がリストの長さに与える影響です。これが真であることを Idris に安全に教えることができます：

```idris
0 concatLen : (xs,ys : List a) -> length xs + length ys = length (xs ++ ys)
concatLen []        ys = Refl
concatLen (x :: xs) ys = cong S $ concatLen xs ys
```

上記の補題を使えば、`LenList` の連結を実装できます：

```idris
(++) : LenList m a -> LenList n a -> LenList (m + n) a
MkLenList xs ++ MkLenList ys =
  rewrite concatLen xs ys in MkLenList (xs ++ ys)
```

しかし、文字列（`String`）に対しては同じことができません。文字列とその長さをペアにすることが役立つアプリケーションは存在しますが（例えば、パース処理中に文字列が狭義に短くなっていることを保証し、最終的に完全に消費されることを保証したい場合など）、Idris はこれらを正しく証明する手助けをしてくれません。以下の補題を安全に実装（証明）する方法は存在しないのです：

```idris
0 concatLenStr : (a,b : String) -> length a + length b = length (a ++ b)
```

<!-- markdownlint-disable MD026 -->

## 信じるか信じないかはあなた次第: `believe_me` (Believe Me!)

<!-- markdownlint-enable MD026 -->

`concatLenStr` を実装するには、すべての安全性を捨て去り、型強制（type coercion）の究極の手段である `believe_me` を使う必要があります。このプリミティブ関数を使うと、任意の型の値を他の任意の型の値へ自由に強制変換できます。言うまでもなく、これは自分が何をしているかを **本当に** 理解している場合にのみ安全です：

```idris
concatLenStr a b = believe_me $ Refl {x = length a + length b}
```

`{x = length a + length b}` で変数 `x` を明示的に指定しているのは、そうしないと Idris が *未解決のホール（unsolved hole）* について警告を出すためです（`Refl` コンストラクタ内のパラメータ `x` の型を推論できないため）。結果をいずれにせよ `believe_me` に渡すため、ここで `x` には任意の型を割り当てることができますが、意図を明確にするために等式の片側の型を割り当てるのが良い習慣です。

プリミティブ型の複雑さが増すほど、最も基本的な性質でさえ成り立つと仮定することはリスクを伴います。例えば、浮動小数点数の加算が結合的であるという錯覚にとらわれるかもしれません：

```idris
0 doubleAddAssoc : (x,y,z : Double) -> x + (y + z) = (x + y) + z
doubleAddAssoc x y z = believe_me $ Refl {x = x + (y + z)}
```

しかし、これは誤り（嘘）です。そして偽りの前提は `Void`（矛盾）の証明へと直結します：

```idris
Tiny : Double
Tiny = 0.0000000000000001

One : Double
One = 1.0

wrong : (0 _ : 1.0000000000000002 = 1.0) -> Void
wrong Refl impossible

boom : Void
boom = wrong (doubleAddAssoc One Tiny Tiny)
```

上記のコードで何が起きているか説明します。`doubleAddAssoc` の呼び出しは、`One + (Tiny + Tiny)` が `(One + Tiny) + Tiny` に等しいという証明を返します。しかし、`One + (Tiny + Tiny)` は `1.0000000000000002` に等しく、`(One + Tiny) + Tiny` は `1.0` に等しくなります。したがって、型が一致しているためこの（間違った）証明を `wrong` に渡すことができ、その結果 `Void` の証明が導かれてしまいます。

<!-- vi: filetype=idris2:syntax=markdown
-->
