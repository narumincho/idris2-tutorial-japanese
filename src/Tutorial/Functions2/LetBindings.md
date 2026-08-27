# Let 束縛とローカル定義

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functions2/LetBindings.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functions2/LetBindings.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.Functions2.LetBindings

%default total
```

これまで見てきた関数は、追加の補助関数やローカル変数を必要とせず、パターンマッチだけで直接実装できるシンプルなものでした。しかし常にそうとは限りません。新しいローカル変数や関数を導入・再利用するための重要な言語機能が2つ存在します。2つのケーススタディを通してこれらを見ていきましょう。

## ユースケース 1: 算術平均と標準偏差

この例では、浮動小数点数のリストの算術平均（相加平均）と標準偏差を計算します。考慮すべき点がいくつかあります。

まず、数値のリストの合計を計算する関数が必要です。*Prelude* はそのための関数 `sum` をエクスポートしています：

```repl
Main> :t sum
Prelude.sum : Num a => Foldable t => t a -> a
```

これは前章の練習問題 10 で作成した `sumList` に似ていますが、`Foldable` の実装を持つすべてのコンテナ型に一般化されています。`Foldable` インターフェースについては後のセクションで学びます。

また分散を計算するためには、リスト内の各値から平均値を引いて2乗する必要があるため、リスト内のすべての要素を新しい値に変換する必要があります。前章の練習問題ではこのために `mapList` を定義しました。*Prelude* にも同様の関数 `map` がエクスポートされており、これはより一般的で `Maybe` に対する `mapMaybe` や `Either e` に対する `mapEither` としても機能します：

```repl
Main> :t map
Prelude.map : Functor f => (a -> b) -> f a -> f b
```

`Functor` インターフェースについても後のセクションで解説します。

最後に、リストの長さを計算する方法が必要です。これには `length` 関数を使用します：

```repl
Main> :t List.length
Prelude.List.length : List a -> Nat
```

ここで `Nat` は自然数（無制限の非負整数）の型です。`Nat` はプリミティブなデータ型ではなく、データコンストラクタ `Z : Nat`（0用）と `S : Nat -> Nat`（後続者用）を持つ *Prelude* で定義された直和型です。このように自然数を定義するのは非常に非効率に見えるかもしれませんが、Idris コンパイラはこれらやその他の「数値風」の型を特別扱いし、コード生成時にプリミティブな整数に最適化して置き換えます。

これで `mean` を実装する準備が整いました。Idris では明確なセマンティクスを重視するため、単に `Double` のタプルを返すのではなく、専用のレコード型を素早く定義します。これにより、どの浮動小数点数がどの統計値に対応するかが明確になります：

```idris
square : Double -> Double
square n = n * n

record Stats where
  constructor MkStats
  mean      : Double
  variance  : Double
  deviation : Double

stats : List Double -> Stats
stats xs =
  let len      := cast (length xs)
      mean     := sum xs / len
      variance := sum (map (\x => square (x - mean)) xs) / len
   in MkStats mean variance (sqrt variance)
```

REPL で試してみましょう：

```repl
Tutorial.Functions2> stats [2,4,4,4,5,5,7,9]
MkStats 5.0 4.0 2.0
```

正常に動作しているようです。ステップごとに確認していきましょう。実装の後半で複数回使用するローカル変数（`len`, `mean`, `variance`）を導入しています。これには **let 束縛 (let binding)** を使用します。これは `let` キーワードに続き、1つ以上の変数への代入、そして `in` で始まる最終的な式で構成されます。ここでもインデント（空白）が意味を持つことに注意してください。3つの変数名は揃えて記述する必要があります。代入演算子 `:=` の位置を揃えるかどうかは任意ですが、可読性を高めるために揃えるのが一般的です。

各変数とその型についても見てみましょう。`len` はリストの長さを `Double` にキャストしたものです（後で他の `Double` の値をリストの長さで除算するため）。Idris はこれに関して非常に厳格であり、明示的なキャストなしに異なる数値型を混在させることはできません。この場合、Idris は周囲の文脈から `len` の型を推論できます。`mean` は単純で、リストの要素を `sum` してリストの長さで割ります。`variance` はこの中で最も複雑で、無名関数を使って各要素から平均値を引いて2乗し、それらを合計して要素数で割っています。

## ユースケース 2: シンプルな Web サーバーのシミュレーション

2つ目のユースケースでは、もう少し大きめのアプリケーションを作成します。これにより、実装したいビジネスロジックを中心にデータ型や関数をどのように設計するかの感覚を掴むことができます。

ユーザーがアルバムを購入してオンラインで聴くことができる音楽ストリーミング Web サーバーを運用していると仮定します。ユーザーがサーバーに接続し、購入したアルバムの1つにアクセスする処理をシミュレートします。

まずいくつかのレコード型を定義します：

```idris
record Artist where
  constructor MkArtist
  name : String

record Album where
  constructor MkAlbum
  name   : String
  artist : Artist

record Email where
  constructor MkEmail
  value : String

record Password where
  constructor MkPassword
  value : String

record User where
  constructor MkUser
  name     : String
  email    : Email
  password : Password
  albums   : List Album
```

いくつかのケース（`Email`, `Artist`, `Password`）では、単一の値を新しいレコード型でラップしている点に注目してください。もちろん生の `String` を使うこともできましたが、それでは多数の `String` フィールドができてしまい、区別がつきにくくなります。メールアドレスの文字列とパスワードの文字列を混同しないように、両方を新しいレコード型でラップすることで、いくつかのインターフェースを再実装する手間の代わりに型安全性を劇的に高めることができます。これには *Prelude* のユーティリティ関数 `on` が非常に便利です：

```idris
Eq Artist where (==) = (==) `on` name

Eq Email where (==) = (==) `on` value

Eq Password where (==) = (==) `on` value

Eq Album where (==) = (==) `on` \a => (a.name, a.artist)
```

`Album` の場合、レコードの2つのフィールドをペア（`Pair`）にラップしており、ペアにはすでに `Eq` の実装が存在します。これにより、ここでも `on` 関数を便利に利用できます。

次に、サーバーのリクエストとレスポンスを表すデータ型を定義します：

```idris
record Credentials where
  constructor MkCredentials
  email    : Email
  password : Password

record Request where
  constructor MkRequest
  credentials : Credentials
  album       : Album

data Response : Type where
  UnknownUser     : Email -> Response
  InvalidPassword : Response
  AccessDenied    : Email -> Album -> Response
  Success         : Album -> Response
```

サーバーのレスポンスには、クライアントリクエストの取り得る結果を表現する独自の直和型を使用します。実際のシステムでは `Success` の場合は実際のアルバムストリームを開始するための接続情報などを返しますが、ここでは見つかったアルバムをラップしてこの挙動をシミュレートします。

これで、サーバーでのリクエスト処理をシミュレートする準備ができました。ユーザーデータベースのエミュレーションには、ユーザーのシンプルなリストを使用します。実装する関数の型は以下の通りです：

```idris
DB : Type
DB = List User

handleRequest : DB -> Request -> Response
```

`List User` の短いエイリアスとして `DB` を定義した点に注目してください。これは長い型シグネチャを読みやすくし、その文脈での型の意味を明確にするのに役立ちます。ただし、これは新しい型を導入するわけではなく、型安全性を高めるものでもありません。`DB` は `List User` と **完全に同一** であり、`List User` が期待される場所で `DB` を使用でき、その逆も同様です。そのため、より複雑なプログラムでは、値を単一フィールドのレコードでラップして新しい型を定義することが推奨されます。

処理の流れは次のようになります：まずデータベースからメールアドレスで `User` を検索します。見つかった場合は、指定されたパスワードとユーザーの実際のパスワードを比較します。一致した場合は、ユーザーのアルバム一覧から要求されたアルバムを検索します。これらすべてのステップが成功した場合、結果は `Success` にラップされた `Album` になります。いずれかのステップが失敗した場合、結果には何が失敗したのかが正確に示されます。

以下に実装例を示します：

```idris
handleRequest db (MkRequest (MkCredentials email pw) album) =
  case lookupUser db of
    Just (MkUser _ _ password albums)  =>
      if password == pw then lookupAlbum albums else InvalidPassword

    Nothing => UnknownUser email

  where lookupUser : List User -> Maybe User
        lookupUser []        = Nothing
        lookupUser (x :: xs) =
          if x.email == email then Just x else lookupUser xs

        lookupAlbum : List Album -> Response
        lookupAlbum []        = AccessDenied email album
        lookupAlbum (x :: xs) =
          if x == album then Success album else lookupAlbum xs
```

この例でいくつか注目してほしい点があります。まず、1つのパターンマッチでネストしたレコードから値を抽出できている点です。次に、`where` ブロック内に `lookupUser` と `lookupAlbum` という2つの **ローカル関数** を定義している点です。これらは両方とも、外側のスコープ内のすべての変数にアクセスできます。たとえば `lookupUser` は実装の1行目のパターンマッチから `email` 変数を使用しており、`lookupAlbum` は `album` 変数を使用しています。

`where` ブロックは、外側のスコープおよび同じ `where` ブロック内で後から定義された他の関数からのみアクセス可能な新しいローカル定義を導入します。これらには明示的な型シグネチャが必要であり、同じインデント幅で整列させる必要があります。

ローカル定義は、`let` キーワードを使用して関数の実装の **前** に導入することもできます。この `let` の使い方は、中間計算の結果を束縛して再利用する先ほどの *let 束縛* と混同しないようにしてください。以下は、`let` キーワードによってローカル定義を導入して `handleRequest` を実装した例です：

```idris
handleRequest' : DB -> Request -> Response
handleRequest' db (MkRequest (MkCredentials email pw) album) =
  let lookupUser : List User -> Maybe User
      lookupUser []        = Nothing
      lookupUser (x :: xs) =
        if x.email == email then Just x else lookupUser xs

      lookupAlbum : List Album -> Response
      lookupAlbum []        = AccessDenied email album
      lookupAlbum (x :: xs) =
        if x == album then Success album else lookupAlbum xs

   in case lookupUser db of
        Just (MkUser _ _ password albums)  =>
          if password == pw then lookupAlbum albums else InvalidPassword

        Nothing => UnknownUser email
```

<!-- vi: filetype=idris2:syntax=markdown
-->
