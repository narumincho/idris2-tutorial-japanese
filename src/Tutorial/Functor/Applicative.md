# Applicative (アプリカティブ関手)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Functor/Applicative.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Functor/Applicative.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

```idris
module Tutorial.Functor.Applicative

import Tutorial.Functor.Functor

import Data.List1
import Data.String
import Data.Vect

%default total
```

`Functor` を使うと、コンテキスト内の値に対して純粋な1引数関数をマップできますが、複数のコンテキスト内の値を多引数関数に渡して結合することはできません。

たとえば、以下の関数を考えてみましょう：

```idris
liftMaybe2 : (a -> b -> c) -> Maybe a -> Maybe b -> Maybe c
liftMaybe2 f (Just va) (Just vb) = Just $ f va vb
liftMaybe2 _ _         _         = Nothing

liftVect2 : (a -> b -> c) -> Vect n a -> Vect n b -> Vect n c
liftVect2 _ []        []        = []
liftVect2 f (x :: xs) (y :: ys) = f x y :: liftVect2 f xs ys

liftIO2 : (a -> b -> c) -> IO a -> IO b -> IO c
liftIO2 f ioa iob = fromPrim $ go (toPrim ioa) (toPrim iob)
  where go : PrimIO a -> PrimIO b -> PrimIO c
        go pa pb w =
          let MkIORes va w2 = pa w
              MkIORes vb w3 = pb w2
           in MkIORes (f va vb) w3
```

この振る舞いは `Functor` ではカバーできませんが、プログラミングでは非常によく行われる操作です。たとえば、標準入力から2つの数値を読み取り（どちらの操作も失敗する可能性がある）、それらの積を計算したいとします：

```idris
multNumbers : Num a => Neg a => IO (Maybe a)
multNumbers = do
  s1 <- getLine
  s2 <- getLine
  pure $ liftMaybe2 (*) (parseInteger s1) (parseInteger s2)
```

さらに、3引数関数と3つの `Maybe` 引数に対応する `liftMaybe3` や、任意の個数の引数に対応する関数も欲しくなります。

それだけではありません。純粋な値を対象のコンテキストに持ち上げる（リフトする）ことも必要になります。これがあれば、以下のようなことができるようになります：

```idris
liftMaybe3 : (a -> b -> c -> d) -> Maybe a -> Maybe b -> Maybe c -> Maybe d
liftMaybe3 f (Just va) (Just vb) (Just vc) = Just $ f va vb vc
liftMaybe3 _ _         _         _         = Nothing

pureMaybe : a -> Maybe a
pureMaybe = Just

multAdd100 : Num a => Neg a => String -> String -> Maybe a
multAdd100 s t = liftMaybe3 calc (parseInteger s) (parseInteger t) (pure 100)
  where calc : a -> a -> a -> a
        calc x y z = x * y + z
```

この振る舞いをカプセル化する新しいインターフェースが **`Applicative`** です。以下はその定義と実装例です：

```idris
public export
interface Functor' f => Applicative' f where
  app   : f (a -> b) -> f a -> f b
  pure' : a -> f a

export
implementation Applicative' Maybe where
  app (Just fun) (Just val) = Just $ fun val
  app _          _          = Nothing

  pure' = Just
```

`Applicative` インターフェースは *Prelude* でエクスポートされています。そこでは `app` 関数は **`(<*>)`** という演算子（*apply* または *app* と呼ばれます）になっています。

`liftMaybe2` や `liftIO3` のような関数と *apply* 演算子 `(<*>)` がどう関係しているのか疑問に思うかもしれません。以下をお見せしましょう：

```idris
liftA2 : Applicative f => (a -> b -> c) -> f a -> f b -> f c
liftA2 fun fa fb = pure fun <*> fa <*> fb

liftA3 : Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
liftA3 fun fa fb fc = pure fun <*> fa <*> fb <*> fc
```

ここで何が起きているかを理解することは非常に重要です。`f` を `Maybe` に特化させた場合、`pure fun` は `Maybe (a -> b -> c)` 型になります。そして `pure fun <*> fa` は `Maybe (b -> c)` 型になります。`(<*>)` が `fa` に格納された値を `pure fun` に格納された関数に適用するためです（カリー化！）。

このように、リフトする関数のアリティ（引数の数）の分だけ `(<*>)` を連鎖させるパターンがよく使われます。また、最初の `pure` の呼び出しを省略して `map` 演算子 `(<$>)` を使う以下の書き方も一般的です：

```idris
liftA2' : Applicative f => (a -> b -> c) -> f a -> f b -> f c
liftA2' fun fa fb = fun <$> fa <*> fb

liftA3' : Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
liftA3' fun fa fb fc = fun <$> fa <*> fb <*> fc
```

このように、`Applicative` インターフェースを使用すると、値（および関数！）を計算コンテキストに持ち上げ、同じコンテキスト内の値に適用することができます。

## イディオムブラケット (Idiom Brackets `[| ... |]`)

`liftA2'` や `liftA3'` で使用したプログラミングスタイルは **アプリカティブスタイル (applicative style)** とも呼ばれ、Haskell で複数のエフェクトフルな計算を単一の純粋関数で組み合わせる際によく使われます。

Idris には、このような演算子の連鎖に対する便利な代替構文として **イディオムブラケット (idiom brackets)** `[| ... |]` が用意されています：

```idris
liftA2'' : Applicative f => (a -> b -> c) -> f a -> f b -> f c
liftA2'' fun fa fb = [| fun fa fb |]

liftA3'' : Applicative f => (a -> b -> c -> d) -> f a -> f b -> f c -> f d
liftA3'' fun fa fb fc = [| fun fa fb fc |]
```

上記の実装は、**曖昧さ解消・型チェック・暗黙引数の補完が行われる前** に、`liftA2` や `liftA3` の形式に自動的に脱糖されます。

## ユースケース: CSV リーダー

Applicative Functor の力と汎用性を理解するために、少し実践的な例を見てみましょう。CSV ファイルのコンテンツをパースしてデコードするユーティリティを作成します。

たとえば、ウェブストアのユーザー情報（名、姓、年齢（省略可能）、メールアドレス、性別、パスワード）を含む簡単な CSV ファイルを考えます：

```repl
Jon,Doe,42,jon@doe.ch,m,weijr332sdk
Jane,Doe,,jane@doe.ch,f,aa433sd112
Stefan,Hoeck,,nope@goaway.ch,m,password123
```

実行時にこの情報を保持するために必要な Idris のデータ型は以下の通りです：

```idris
data Gender = Male | Female | Other

public export
record Name where
  constructor MkName
  value : String

record Email where
  constructor MkEmail
  value : String

record Password where
  constructor MkPassword
  value : String

record User where
  constructor MkUser
  firstName : Name
  lastName  : Name
  age       : Maybe Nat
  email     : Email
  gender    : Gender
  password  : Password
```

まず、CSV ファイルのフィールドを読み取るためのインターフェースを定義し、読み込みたいデータ型に対する実装を作成します：

```idris
public export
interface CSVField a where
  read : String -> Maybe a
```

以下は `Gender` と `Bool` の実装です：

```idris
export
CSVField Gender where
  read "m" = Just Male
  read "f" = Just Female
  read "o" = Just Other
  read _   = Nothing

export
CSVField Bool where
  read "t" = Just True
  read "f" = Just False
  read _   = Nothing
```

数値型には `Data.String` のパース関数を使用できます：

```idris
export
CSVField Nat where
  read = parsePositive

export
CSVField Integer where
  read = parseInteger

export
CSVField Double where
  read = parseDouble
```

省略可能な値（`Maybe a`）の場合、格納される型 `a` 自体が `CSVField` のインスタンスを持っている必要があります。空文字列 `""` を `Nothing` として扱い、空でない文字列を `a` のフィールドリーダーに渡します：

```idris
export
CSVField a => CSVField (Maybe a) where
  read "" = Just Nothing
  read s  = Just <$> read s
```

文字列ラッパー型については、バリデーションロジックを定義します：

```idris
readIf : (String -> Bool) -> (String -> a) -> String -> Maybe a
readIf p mk s = if p s then Just (mk s) else Nothing

isValidName : String -> Bool
isValidName s =
  let len = length s
   in 0 < len && len <= 100 && all isAlpha (unpack s)

export
CSVField Name where
  read = readIf isValidName MkName

isEmailChar : Char -> Bool
isEmailChar '.' = True
isEmailChar '@' = True
isEmailChar c   = isAlphaNum c

isValidEmail : String -> Bool
isValidEmail s =
  let len = length s
   in 0 < len && len <= 100 && all isEmailChar (unpack s)

CSVField Email where
  read = readIf isValidEmail MkEmail

isPasswordChar : Char -> Bool
isPasswordChar ' ' = True
-- isSpace はノーブレークスペース等にもマッチするため、
-- パスワードでは空白文字として ' ' のみを許可します
isPasswordChar c   = not (isControl c) && not (isSpace c)

isValidPassword : String -> Bool
isValidPassword s =
  let len = length s
   in 8 < len && len <= 100 && all isPasswordChar (unpack s)

CSVField Password where
  read = readIf isValidPassword MkPassword
```

次に、CSV ファイルの行全体をデコードします。まずエラー型を定義します：

```idris
public export
data CSVError : Type where
  FieldError           : (line, column : Nat) -> (str : String) -> CSVError
  UnexpectedEndOfInput : (line, column : Nat) -> CSVError
  ExpectedEndOfInput   : (line, column : Nat) -> CSVError
```

`CSVField` を使って指定位置のフィールドを読み取り、失敗した場合は `FieldError` を返します：

```idris
export
readField : CSVField a => (line, column : Nat) -> String -> Either CSVError a
readField line col str =
  maybe (Left $ FieldError line col str) Right (read str)
```

読み取るフィールド数が事前にわかっている場合、文字列のリストを指定した長さの `Vect` に変換します：

```idris
toVect : (n : Nat) -> (line, col : Nat) -> List a -> Either CSVError (Vect n a)
toVect 0     line _   []        = Right []
toVect 0     line col _         = Left (ExpectedEndOfInput line col)
toVect (S k) line col []        = Left (UnexpectedEndOfInput line col)
toVect (S k) line col (x :: xs) = (x ::) <$> toVect k line (S col) xs
```

最後に、CSV の1行を `User` 型の値に変換する `readUser` 関数を実装します：

```idris
readUser' : (line : Nat) -> List String -> Either CSVError User
readUser' line ss = do
  [fn,ln,a,em,g,pw] <- toVect 6 line 0 ss
  [| MkUser (readField line 1 fn)
            (readField line 2 ln)
            (readField line 3 a)
            (readField line 4 em)
            (readField line 5 g)
            (readField line 6 pw) |]

readUser : (line : Nat) -> String -> Either CSVError User
readUser line = readUser' line . forget . split (',' ==)
```

REPL で動作を確認してみましょう：

```repl
Tutorial.Functor> readUser 1 "Joe,Foo,46,j@f.ch,m,pw1234567"
Right (MkUser (MkName "Joe") (MkName "Foo")
  (Just 46) (MkEmail "j@f.ch") Male (MkPassword "pw1234567"))
Tutorial.Functor> readUser 7 "Joe,Foo,46,j@f.ch,m,shortPW"
Left (FieldError 7 6 "shortPW")
```

`readUser'` の実装において、イディオムブラケットを使用して 6引数関数（`MkUser`）を `Either CSVError` 型の 6つの値の上にマップしている点に注目してください。これにより、**すべてのパースが成功した場合にのみ自動的に全体が成功** します。

### ヘテロジニアスリスト (Heterogeneous Lists)

レコード型の汎用的な表現として使用でき、ヘテロジニアスなテーブルの行を最小限のコードで表現・読み込みできるようにする型族：**ヘテロジニアスリスト（型混在リスト / Heterogeneous Lists）** を導入します。

```idris
namespace HList
  public export
  data HList : (ts : List Type) -> Type where
    Nil  : HList Nil
    (::) : (v : t) -> (vs : HList ts) -> HList (t :: ts)
```

ヘテロジニアスリストは、**型のリスト** でインデックス付けされたリスト型です。これにより、各位置にリストインデックスの同じ位置にある型の値を格納できます：

```idris
hlist1 : HList [Bool, Nat, Maybe String]
hlist1 = [True, 12, Nothing]
```

`HList` を使って CSV 行を簡潔にパースしてみましょう。行全体に対応する新しいインターフェースを導入します：

```idris
public export
interface CSVLine a where
  decodeAt : (line, col : Nat) -> List String -> Either CSVError a
```

`HList` に対する `CSVLine` の実装を書きます：

```idris
export
CSVLine (HList []) where
  decodeAt _ _ [] = Right Nil
  decodeAt l c _  = Left (ExpectedEndOfInput l c)

export
CSVField t => CSVLine (HList ts) => CSVLine (HList (t :: ts)) where
  decodeAt l c []        = Left (UnexpectedEndOfInput l c)
  decodeAt l c (s :: ss) = [| readField l c s :: decodeAt l (S c) ss |]
```

これだけで完了です！ トークン分割前の行全体をデコードするユーティリティ関数を追加します：

```idris
decode : CSVLine a => (line : Nat) -> String -> Either CSVError a
decode line = decodeAt line 1 . forget . split (',' ==)

hdecode :  (0 ts : List Type)
        -> CSVLine (HList ts)
        => (line : Nat)
        -> String
        -> Either CSVError (HList ts)
hdecode _ = decode
```

REPL で試してみましょう：

```repl
Tutorial.Functor> hdecode [Bool,Nat,Double] 1 "f,100,12.123"
Right [False, 100, 12.123]
Tutorial.Functor> hdecode [Name,Name,Gender] 3 "Idris,,f"
Left (FieldError 3 2 "")
```

## Applicative の法則 (Applicative Laws)

`Applicative` の実装は以下の法則に従う必要があります：

- `pure id <*> fa = fa`: 恒等関数をリフトして適用しても何も変わらない。
- `[| f . g |] <*> v = f <*> (g <*> v)`: 関数を合成してから適用しても、適用してから合成しても等価である。
- `pure f <*> pure x = pure (f x)`: **準同型性 (Homomorphism)** の法則。
- `f <*> pure v = pure ($ v) <*> f`: **交換 (Interchange)** の法則。純粋な値を `(<*>)` の左から適用しても右から適用しても等価である。

<!-- vi: filetype=idris2:syntax=markdown
-->
