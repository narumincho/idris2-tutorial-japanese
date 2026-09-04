# Functor (関手)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Functor.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Functor.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Functor.Functor

import Data.List1
import Data.String
import Data.Vect

%default total
```

`List`、`List1`、`Maybe`、`IO` といった型コンストラクタにはどのような共通点があるでしょうか？ まず、これらはすべて `Type -> Type` という型を持ちます。次に、これらはすべて指定された型の値を特定の **コンテキスト（文脈）** の中に置きます。`List` のコンテキストは **非決定性 (non-determinism)** です：0個以上の値が存在することはわかっていますが、パターンマッチでリストを分解するまで正確な個数はわかりません。`List1` も同様ですが、少なくとも1つの値が存在することが保証されています。`Maybe` では値がいくつあるかは依然として不確定ですが、選択肢は 0個 または 1個 と大幅に絞られます。`IO` のコンテキストはまったく別のものであり、**任意の副作用** を表します。

上記で挙げた型コンストラクタは、その振る舞いや用途が大きく異なりますが、これらを扱う際には共通して現れる操作が存在します。その代表例が、「**内部の構造に影響を与えることなく、データ構造内の値に純粋関数を適用（マップ）する**」という操作です。

たとえば、数値のリストが与えられたとき、要素の順序を変えたり要素を削除したりすることなく、各数値を2倍にしたいとします：

```idris
multBy2List : Num a => List a -> List a
multBy2List []        = []
multBy2List (x :: xs) = 2 * x :: multBy2List xs
```

あるいは、文字列のリストに含まれるすべての文字列を大文字に変換したいとします：

```idris
toUpperList : List String -> List String
toUpperList []        = []
toUpperList (x :: xs) = toUpper x :: toUpperList xs
```

格納されている値の型が変わる場合もあります。次の例では、リストに格納された文字列の長さを計算します：

```idris
toLengthList : List String -> List Nat
toLengthList []        = []
toLengthList (x :: xs) = length x :: toLengthList xs
```

これらの関数がいかにワンパターンであるかに注目してください。各要素に適用する関数が異なるだけで、関数の骨格はまったく同一です。ここには明らかに抽象化できる共通のパターンが存在します：

```idris
mapList : (a -> b) -> List a -> List b
mapList f []        = []
mapList f (x :: xs) = f x :: mapList f xs
```

これは関数型プログラミングにおける抽象化の第1歩です：（ジェネリックな）高階関数を書くことです。これで、上記のすべての例を `mapList` を使って簡潔に再実装できます：

```idris
multBy2List' : Num a => List a -> List a
multBy2List' = mapList (2 *)

toUpperList' : List String -> List String
toUpperList' = mapList toUpper

toLengthList' : List String -> List Nat
toLengthList' = mapList length
```

しかし、まったく同じことを `List1` や `Maybe` に対しても行いたいと思うはずです！ これらも `List` と同様のコンテナ型であり、保持できる値の個数の詳細が異なるだけです：

```idris
mapMaybe : (a -> b) -> Maybe a -> Maybe b
mapMaybe f Nothing  = Nothing
mapMaybe f (Just v) = Just (f v)
```

さらに `IO` に対しても、エフェクトフルな計算の上に純粋関数をマップできるようにしたいです。データコンストラクタがネストしているため実装は少し複雑になりますが、型に従えば迷うことはありません。なお、`IO` は公開されていないため、そのデータコンストラクタに直接アクセスすることはできません。しかし、`toPrim` と `fromPrim` 関数を使って `IO` と `PrimIO` の相互変換を行うことができ、`PrimIO` は自由に分解できます：

```idris
mapIO : (a -> b) -> IO a -> IO b
mapIO f io = fromPrim $ mapPrimIO (toPrim io)
  where mapPrimIO : PrimIO a -> PrimIO b
        mapPrimIO prim w =
          let MkIORes va w2 = prim w
           in MkIORes (f va) w2
```

「コンテキスト内の値に純粋関数をマップする」という概念から、いくつかの便利な派生関数が導かれます。以下は `IO` における例です：

```idris
mapConstIO : b -> IO a -> IO b
mapConstIO = mapIO . const

forgetIO : IO a -> IO ()
forgetIO = mapConstIO ()
```

もちろん、`mapConst` や `forget` を `List` や `List1`、`Maybe`（およびマッピング関数を持つ多数の型コンストラクタ）に対しても実装したくなりますが、どれもまったく同じ構造になります。

このように、便利な派生関数群を持つ共通の関数クラスに遭遇した場合、インターフェースの定義を検討すべきです。では、どのように定義すればよいでしょうか？ `mapList`、`mapMaybe`、`mapIO` の型を見ると、抽象化して置き換えるべきなのは `List`、`Maybe`、`IO` という型そのものです。これらは `Type` ではなく `Type -> Type` という型を持っています。幸い、Idris では `Type` 以外のカインドを持つ型に対してもインターフェースをパラメータ化できます。

この振る舞いを表すインターフェースは **`Functor`（関手）** と呼ばれます。以下はその定義と実装例です（*Prelude* のインターフェースとの重複を避けるために名前にアポストロフィ `'` を付けています）：

```idris
public export
interface Functor' (0 f : Type -> Type) where
  map' : (a -> b) -> f a -> f b

export
implementation Functor' Maybe where
  map' _ Nothing  = Nothing
  map' f (Just v) = Just $ f v
```

パラメータ `f` の型を明示的に指定する必要があり、実行時に消去されるように多重度 0 で注釈する必要がある点に注意してください。

`map'` のように型パラメータだけで構成された型シグネチャ（特に `f a` のように型パラメータが別のパラメータに適用されているもの）を読むのには慣れが必要です。REPL で暗黙引数も含めて型を確認すると非常に役立ちます：

```repl
Tutorial.Functor> :ti map'
Tutorial.Functor.map' :  {0 b : Type}
                      -> {0 a : Type}
                      -> {0 f : Type -> Type}
                      -> Functor' f
                      => (a -> b)
                      -> f a
                      -> f b
```

型パラメータ `f` を具体的な型に置き換えて確認してみるのも有益です：

```repl
Tutorial.Functor> :t map' {f = Maybe}
map' : (?a -> ?b) -> Maybe ?a -> Maybe ?b
```

型シグネチャを正しく解釈できることは、Idris のコードを理解する上で極めて重要です。

## 派生関数と演算子

`Functor` インターフェースから直接導出される関数や演算子がいくつかあります。これらは非常に便利なので、すべて覚えておくと役立ちます：

```repl
Tutorial.Functor> :t (<$>)
Prelude.<$> : Functor f => (a -> b) -> f a -> f b

Tutorial.Functor> :t (<&>)
Prelude.<&> : Functor f => f a -> (a -> b) -> f b

Tutorial.Functor> :t ($>)
Prelude.$> : Functor f => f a -> b -> f b

Tutorial.Functor> :t (<$)
Prelude.<$ : Functor f => b -> f a -> f b

Tutorial.Functor> :t ignore
Prelude.ignore : Functor f => f a -> f ()
```

`(<$>)` は `map` の中置演算子エイリアスであり、括弧を省略して記述するのに役立ちます：

```idris
tailShowReversNoOp : Show a => List1 a -> List String
tailShowReversNoOp xs = map (reverse . show) (tail xs)

tailShowReverse : Show a => List1 a -> List String
tailShowReverse xs = reverse . show <$> tail xs
```

`(<&>)` は引数を反転させた `(<$>)` のエイリアスです。残りの3つ（`ignore`、`($>)`、`(<$)`）は、コンテキスト内の値を定数で置き換えるために使用されます。値自体には興味がないが構造は保持したい場合に便利です。

## 複数の型パラメータを持つ Functor

これまで見てきた型コンストラクタはすべて `Type -> Type` 型でした。しかし、他の型コンストラクタに対しても `Functor` を実装できます。唯一の前提条件は、`map` 関数で変換したい型パラメータが引数リストの **最後** にあることです。たとえば、以下は `Either e` に対する `Functor` の実装です（`Either e` は要求通り `Type -> Type` 型になります）：

```idris
implementation Functor' (Either e) where
  map' _ (Left ve)  = Left ve
  map' f (Right va) = Right $ f va
```

もう1つの例として、`Bool -> Type -> Type` 型の型コンストラクタ（前章の練習問題に登場した `List01`）に対する実装を示します：

```idris
data List01 : (nonEmpty : Bool) -> Type -> Type where
  Nil  : List01 False a
  (::) : a -> List01 False a -> List01 ne a

implementation Functor (List01 ne) where
  map _ []        = []
  map f (x :: xs) = f x :: map f xs
```

## Functor の合成 (Functor Composition)

Functor の素晴らしい点は、他の Functor とペアにしたりネストしたりでき、その結果もまた Functor になるという点です：

```idris
record Product (f,g : Type -> Type) (a : Type) where
  constructor MkProduct
  fst : f a
  snd : g a

implementation Functor f => Functor g => Functor (Product f g) where
  map f (MkProduct l r) = MkProduct (map f l) (map f r)
```

上記により、2つの Functor のペアに対して一括で map を行うことができます。ただし、型推論を助けるためにいくつかのアノテーションが必要になります：

```idris
toPair : Product f g a -> (f a, g a)
toPair (MkProduct fst snd) = (fst, snd)

fromPair : (f a, g a) -> Product f g a
fromPair (x,y) = MkProduct x y

productExample :  Show a
               => (Either e a, List a)
               -> (Either e String, List String)
productExample = toPair . map show . fromPair {f = Either e, g = List}
```

より一般的には、ネストした複数の Functor の層に対して一度に map を適用したい場合があります：

```idris
record Comp (f,g : Type -> Type) (a : Type) where
  constructor MkComp
  unComp  : f (g a)

implementation Functor f => Functor g => Functor (Comp f g) where
  map f (MkComp v) = MkComp $ map f <$> v

compExample :  Show a => List (Either e a) -> List (Either e String)
compExample = unComp . map show . MkComp {f = List, g = Either e}
```

### 名前付き実装 (Named Implementations)

特定の型に対してインターフェースを実装する方法が複数存在することがあります。たとえば数値型に対しては、加算を表す `Monoid` と乗算を表す `Monoid` を定義できます。同様に、ネストした Functor に対しても、`map` を外側の1層のみに対するマッピングと解釈することも、複数層にわたるマッピングと解釈することもできます。

これに対処する1つの方法は、上記の `Comp` のように単一フィールドのラッパーを定義することです。しかし Idris では、インターフェース実装に名前を付けて定義する **名前付き実装 (named implementations)** もサポートしています：

```idris
[Compose'] Functor f => Functor g => Functor (f . g) where
  map f = (map . map) f
```

これは新しい `Functor` の実装を定義しますが、曖昧さを避けるために通常の暗黙の解決では **考慮されません**。しかし、`@` をプレフィックスとして `map` に明示的な引数として渡すことで、この実装を選択して使用することができます：

```idris
compExample2 :  Show a => List (Either e a) -> List (Either e String)
compExample2 = map @{Compose} show
```

上の例では、*Prelude* ですでにエクスポートされている `Compose` を使用しています。

## Functor の法則 (Functor Laws)

`Eq` や `Ord` と同様に、`Functor` の実装は以下の数学的法則に従うことが期待されます：

1. `map id = id`: 恒等関数を map しても、コンテナの構造が変化したり、`IO` アクションの副作用が変化したりするような目に見える変化を生じさせてはならない。
2. `map (f . g) = map f . map g`: 2つの map 操作を連続して適用することは、2つの関数を合成した単一の関数を map することと等価でなければならない。

これら2つの法則は、`map` が値の **構造を保持する** ことを要求しています。これは `List`、`Maybe`、`Either e` などのコンテナ型を考えると直感的に理解できます。`map` は要素を追加・削除したり、リストの順序を変更したりしてはいけません。`IO` の文脈では、`map` が追加の副作用を実行してはならないことを意味します。

<!-- vi: filetype=idris2:syntax=markdown
-->
