# 列挙型 練習問題

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/Exercises1.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/Exercises1.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.Exercises1
```

これらの練習問題の解答は [`src/Solutions/DataTypes.idr`](../../Solutions/DataTypes.md) にあります。

## 練習問題 1

パターンマッチを使用して、ブール演算子 `(&&)` と `(||)` の独自バージョンをそれぞれ `and` と `or` という名前で実装してください。

> [!TIP]
> 1つの方法は、2つのブール値の4通りの組み合わせをすべて列挙してそれぞれ結果を記述することです。しかし、各関数につき2つのパターンマッチだけで済む、より短くスマートな方法もあります。

## 練習問題 2

時間のさまざまな単位（秒、分、時間、日、週）を表す独自のデータ型を定義し、異なる単位の時間幅の間で変換を行う以下の関数を実装してください。

> [!TIP]
> 秒から時間のようなより大きな単位へ変換する際は、整数除算（`div`）を使用してください。

```idris
data UnitOfTime = Second -- 他の値を適宜追加してください

-- 指定された時間単位のステップ数から
-- 秒数を計算する
total
toSeconds : UnitOfTime -> Integer -> Integer

-- 指定された秒数から、
-- 指定された時間単位のステップ数を計算する
total
fromSeconds : UnitOfTime -> Integer -> Integer

-- ある時間単位のステップ数を別の時間単位のステップ数に変換する。
-- 実装には `fromSeconds` と `toSeconds` を使用してください
total
convert : UnitOfTime -> Integer -> UnitOfTime -> Integer
```

## 練習問題 3

化学元素のサブセット（水素: H、炭素: C、窒素: N、酸素: O、フッ素: F）を表すデータ型を定義してください。

各元素について、その原子量（ダルトン単位）を返す関数 `atomicMass` を宣言・実装してください：

```repl
Hydrogen : 1.008
Carbon : 12.011
Nitrogen : 14.007
Oxygen : 15.999
Fluorine : 18.9984
```

<!-- vi: filetype=idris2:syntax=markdown
-->
