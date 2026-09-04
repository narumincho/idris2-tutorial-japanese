# *Prelude* のインターフェース

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Interfaces/Prelude.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Interfaces/Prelude.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Interfaces.Prelude
```

Idris の *Prelude* は、実用的なほぼすべてのプログラムで役立ついくつかのインターフェースとその実装を提供しています。ここでは基本的なものを紹介します。より高度なインターフェースについては後の章で解説します。

これらのインターフェースの多くには関連する数学的な法則（則）が存在し、実装はそれらの法則に従うことが想定されています。ここではそれらの法則についても併記します。

### `Eq`

おそらく最も頻繁に使用されるインターフェースである `Eq` は、前述の例における `Equals` インターフェースに対応します。`Eq` は、同じ型の2つの値が等しいか否かを比較するための2つの演算子 `(==)` と `(/=)` を提供します。*Prelude* で定義されているほとんどのデータ型には `Eq` の実装が用意されており、プログラマが独自のデータ型を定義する際にも、通常最初に実装するインターフェースの1つです。

#### `Eq` の法則

すべての `Eq` 実装は以下の法則を満たすことが期待されます：

- `(==)` は **反射的 (reflexive)**: すべての `x` について `x == x = True`。つまり、すべての値は自分自身と等しい。
- `(==)` は **対称的 (symmetric)**: すべての `x` と `y` について `x == y = y == x`。つまり、`(==)` に渡す引数の順序は結果に影響しない。
- `(==)` は **推移的 (transitive)**: `x == y = True` かつ `y == z = True` ならば `x == z = True`。
- `(/=)` は `(==)` の否定: すべての `x` と `y` について `x == y = not (x /= y)`。

理論上、Idris は非プリミティブな多くの型に対してこれらの法則をコンパイル時に検証する能力を持っています。しかし、厳密な証明を書くのは非常に骨が折れる作業であるため、実用上の観点から `Eq` を実装する際に証明までは要求されません。

### `Ord`

*Prelude* における `Comp` に対応するインターフェースが `Ord` です。独自の `comp` と同等である `compare` に加え、比較演算子 `(>=)`、`(>)`、`(<=)`、`(<)` や、ユーティリティ関数 `max`、`min` を提供します。`Comp` とは異なり、`Ord` は `Eq` を継承（拡張）しているため、`Ord` 制約がある場所では演算子 `(==)` や `(/=)`、および関連する関数も利用できます。

#### `Ord` の法則

すべての `Ord` 実装は以下の法則を満たすことが期待されます：

- `(<=)` は **反射的** かつ **推移的** である。
- `(<=)` は **反対称的 (antisymmetric)**: `x <= y = True` かつ `y <= x = True` ならば `x == y = True`。
- `x <= y = y >= x`
- `x < y = not (y <= x)`
- `x > y = not (y >= x)`
- `compare x y = EQ` $\implies$ `x == y = True`
- `compare x y == GT = x > y`
- `compare x y == LT = x < y`

### `Semigroup` と `Monoid`

`Semigroup`（半群）は、二項演算子 `(<+>)`（*append* とも呼ばれます）を提供するインターフェースです。

同様に、`Monoid`（モノイド）は単位元 `neutral` を提供します。

これらは極めて重要なインターフェースであり、あるデータ型の2つ以上の値を同じ型の単一の値へと結合するために使用されます。例としては、数値型の加算や乗算、データ列の連結、計算の逐次実行などが挙げられます。

例として、幾何学アプリケーションで距離を表すデータ型を考えてみましょう。単に `Double` を使うこともできますが、型安全ではありません。`Double` をラップした単一フィールドのレコード型を定義し、明確な意味論を与えるのが良い方法です：

```idris
record Distance where
  constructor MkDistance
  meters : Double
```

2つの距離を結合する自然な方法があります。保持している値を足し合わせることです。これは直ちに `Semigroup` の実装につながります：

```idris
Semigroup Distance where
  x <+> y = MkDistance $ x.meters + y.meters
```

また、ゼロがこの操作の単位元（neutral element）であることも明らかです。任意の値にゼロを足しても元の値は変わりません。これにより、`Monoid` も実装できます：

```idris
Monoid Distance where
  neutral = MkDistance 0
```

#### `Semigroup` と `Monoid` の法則

すべての `Semigroup` および `Monoid` 実装は以下の法則を満たすことが期待されます：

- `(<+>)` は **結合的 (associative)**: すべての `x`, `y`, `z` について `x <+> (y <+> z) = (x <+> y) <+> z`。
- `neutral` は `(<+>)` に関する **単位元 (neutral element)**: すべての `x` について `neutral <+> x = x <+> neutral = x`。

### `Show`

`Show` インターフェースは主にデバッグ用途で使用され、指定された型の値を、その値を作成する Idris コードに近い文字列として表示するためのものです。これには、必要に応じて引数を括弧で適切に囲む処理も含まれます。たとえば、REPL で以下の関数の出力を試してみてください：

```idris
showExample : Maybe (Either String (List (Maybe Integer))) -> String
showExample = show
```

REPL での実行結果：

```repl
Tutorial.Interfaces> showExample (Just (Right [Just 12, Nothing]))
"Just (Right [Just 12, Nothing])"
```

`Show` のインスタンスを実装する方法については練習問題で学びます。

### リテラルのオーバーロード (Overloaded Literals)

Idris では、整数リテラル（`12001`）、文字列リテラル（`"foo bar"`）、浮動小数点数リテラル（`12.112`）、文字リテラル（`'$'`）などのリテラル値をオーバーロードできます。つまり、文字列リテラルから `String` 以外の型の値を作成することができます。この詳細な仕組みは別のセクションで説明しますが、多くの一般的なケースでは、対象の型が `FromString`（文字列リテラル用）、`FromChar`（文字リテラル用）、または `FromDouble`（浮動小数点数リテラル用）インターフェースを実装していれば十分です。整数リテラルの場合は特別であり、次のセクションで説明します。

`FromString` の使用例を見てみましょう。ユーザーがユーザー名とパスワードで認証を行うアプリケーションを作成するとします。どちらも文字の並び（文字列）で構成されるため、意味論が大きく異なるにもかかわらず、取り違えて混同しやすいです。このような場合、取り違えはセキュリティ上の懸念にもなるため、それぞれに固有の新しい型を定義することが推奨されます。

以下に3つのレコード型の例を示します：

```idris
record UserName where
  constructor MkUserName
  name : String

record Password where
  constructor MkPassword
  value : String

record User where
  constructor MkUser
  name     : UserName
  password : Password
```

テストのためであっても、`User` 型の値を作成するには、すべての文字列をコンストラクタでラップする必要があります：

```idris
hock : User
hock = MkUser (MkUserName "hock") (MkPassword "not telling")
```

これは少々煩雑であり、型安全性を高めるためだけにこの記述量は大きすぎる代償だと感じる人もいるかもしれません。幸いなことに、リテラルのオーバーロードによって文字列リテラルの利便性を簡単に取り戻すことができます：

```idris
FromString UserName where
  fromString = MkUserName

FromString Password where
  fromString = MkPassword

hock2 : User
hock2 = MkUser "hock" "not telling"
```

### 数値インターフェース (Numeric Interfaces)

*Prelude* は、通常の算術演算を提供する複数のインターフェースもエクスポートしています。以下はインターフェースとそれが提供する関数の一覧です：

- `Num`
  - `(+)` : 加算
  - `(*)` : 乗算
  - `fromInteger` : 整数リテラルのオーバーロード
- `Neg`
  - `negate` : 符号反転
  - `(-)` : 減算
- `Integral`
  - `div` : 整数除算
  - `mod` : 剰余演算
- `Fractional`
  - `(/)` : 除算
  - `recip` : 逆数の計算

このように、特定の型で整数リテラルを使用できるようにするには `Num` インターフェースを実装する必要があります。また、`-12` のような負の整数リテラルを使用するには `Neg` インターフェースも実装する必要があります。

### `Cast`

本節で最後に簡単に紹介するインターフェースは `Cast` です。これは `cast` 関数を介して、ある型の値を別の型の値に変換するために使用されます。`Cast` はこれまで見てきた1つの型パラメータを持つインターフェースとは異なり、**2つ** の型パラメータでパラメータ化されている点が特徴的です。

現時点での `Cast` は、標準ライブラリにおけるプリミティブ型間（特に数値型間）の相互変換のために主に使用されています。*Prelude* からエクスポートされている実装を見ると（たとえば REPL で `:doc Cast` を実行）、プリミティブ型のほとんどの組み合わせに対して多数の実装が存在することがわかります。

<!-- vi: filetype=idris2:syntax=markdown
-->
