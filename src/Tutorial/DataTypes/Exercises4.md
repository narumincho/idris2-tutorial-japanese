# ジェネリックデータ型 練習問題

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/Exercises4.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/Exercises4.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.Exercises4

import Tutorial.DataTypes.SumTypes
```

```idris hide
-- Define this so we can syntax highlight the examples using it, but don't show it
data Element = C | H | O
```

これらの練習問題の解答は [`src/Solutions/DataTypes.idr`](../../Solutions/DataTypes.md) にあります。

純粋関数型言語でのプログラミングが初めての場合、これらの練習問題は **非常に重要** です。飛ばさずに、時間をかけてすべて取り組んでみてください。最初は難解に見えるかもしれませんが、多くの場合、型シグネチャ自体が何をすべきかを教えてくれます。必要に応じて各問題のコメントも参考にしてください。

関数の型シグネチャにおける小文字の識別子は型パラメータとして扱われることを思い出してください。

## 練習問題 1

`Maybe` に対する以下のジェネリック関数を実装してください：

```idris
-- `Just` を別の `Just` にマップするようにしてください
total
mapMaybe : (a -> b) -> Maybe a -> Maybe b

-- 例: `appMaybe (Just (+2)) (Just 20) = Just 22`
total
appMaybe : Maybe (a -> b) -> Maybe a -> Maybe b

-- 例: `bindMaybe (Just 12) Just = Just 12`
total
bindMaybe : Maybe a -> (a -> Maybe b) -> Maybe b

-- 与えられた述語が True を返す場合にのみ `Just` 内の値を保持する
total
filterMaybe : (a -> Bool) -> Maybe a -> Maybe a

-- `Nothing` ではない最初の値（あれば）を保持する
total
first : Maybe a -> Maybe a -> Maybe a

-- `Nothing` ではない最後の値（あれば）を保持する
total
last : Maybe a -> Maybe a -> Maybe a

-- これは `Maybe` から値を抽出するためのもう1つの汎用的な方法です。
-- 以下が成り立つように実装してください：
-- `foldMaybe (+) 5 Nothing = 5`
-- `foldMaybe (+) 5 (Just 12) = 17`
total
foldMaybe : (acc -> el -> acc) -> acc -> Maybe el -> acc
```

## 練習問題 2

`Either` に対する以下のジェネリック関数を実装してください：

```idris
total
mapEither : (a -> b) -> Either e a -> Either e b

-- 両方の `Either` が `Left` の場合は、
-- 最初の `Left` に格納されている値を保持してください
total
appEither : Either e (a -> b) -> Either e a -> Either e b

total
bindEither : Either e a -> (a -> Either e b) -> Either e b

-- `Left` ではない最初の値を保持する。
-- 両方とも `Left` の場合は、与えられた累積関数を使ってエラー値を結合する
total
firstEither : (e -> e -> e) -> Either e a -> Either e a -> Either e a

-- `Left` ではない最後の値を保持する。
-- 両方とも `Left` の場合は、与えられた累積関数を使ってエラー値を結合する
total
lastEither : (e -> e -> e) -> Either e a -> Either e a -> Either e a

total
fromEither : (e -> c) -> (a -> c) -> Either e a -> c
```

## 練習問題 3

`List` に対する以下のジェネリック関数を実装してください：

```idris
total
mapList : (a -> b) -> List a -> List b

total
filterList : (a -> Bool) -> List a -> List a

-- リストの連結 (++) を再実装してください（例: (++) [1, 2] [3, 4] = [1, 2, 3, 4]）
-- 注意: この関数は標準の Prelude.List.(++) と衝突するため、
-- 使用する際は DataTypes.(++) や Ch3.(++) のようにモジュール名をプレフィックスにする必要があります。
-- あるいは、関数名を myListConcat や concat' のような独自の名前にしても構いません。
total
(++) : List a -> List a -> List a

-- リストが空でなければ、先頭の要素を返す
total
headMaybe : List a -> Maybe a

-- リストが空でなければ、先頭以外のすべての要素を返す
total
tailMaybe : List a -> Maybe (List a)

-- リストが空でなければ、末尾の要素を返す
total
lastMaybe : List a -> Maybe a

-- リストが空でなければ、末尾以外のすべての要素を返す
total
initMaybe : List a -> Maybe (List a)

-- 与えられた累積関数と初期値を使用して、リスト内の値を畳み込む（集計する）
--
-- 例:
-- `foldList (+) 10 [1,2,7] = 20`
-- `foldList String.(++) "" ["Hello","World"] = "HelloWorld"`
-- `foldList last Nothing (mapList Just [1,2,3]) = Just 3`
total
foldList : (acc -> el -> acc) -> acc -> List el -> acc
```

## 練習問題 4

Web アプリケーションのユーザーデータを以下のレコードに保存するとします：

```idris
record Client where
  constructor MkClient
  name          : String
  title         : Title
  age           : Bits8
  passwordOrKey : Either Bits64 String
```

前の練習問題で作成した `LoginError` を使い、`Client` のリストと `Credentials` 型の値を受け取り、有効な資格情報が提供されなかった場合は `LoginError` を返し、資格情報が一致した場合はその最初の `Client` を返す関数 `login` を実装してください。

## 練習問題 5

前の練習問題で作成した化学元素のデータ型を使用して、分子式のモル質量を計算する関数を実装してください。

分子式の表現には、各元素とその個数（自然数 `Nat`）のペアのリストを使用します。たとえば以下のようになります：

```idris
ethanol : List (Element,Nat)
ethanol = [(C,2),(H,6),(O,1)]
```

ヒント: 自然数を `Double` に変換するには `cast` 関数を使用できます。

<!-- vi: filetype=idris2:syntax=markdown
-->
