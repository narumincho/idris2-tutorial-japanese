# レコード 練習問題

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/Exercises3.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/Exercises3.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

これらの練習問題の解答は [`src/Solutions/DataTypes.idr`](../../Solutions/DataTypes.md) にあります。

## 練習問題 1

`UnitOfTime` と、その単位における時間幅を表す整数をペアにした時間幅（タイムスパン）を表すレコード型を定義してください。また、時間幅を秒単位の `Integer` に変換する関数も定義してください。

## 練習問題 2

時間幅の等値性判定関数を実装してください。2つの時間幅は、秒数換算で等しい場合にのみ等しいとみなされる必要があります。

## 練習問題 3

時間幅を整形して文字列化（プリティプリント）する関数を実装してください。結果の文字列には、指定された単位での時間幅を表示し、単位が秒以外の場合は括弧内に秒数も表示するようにしてください。

## 練習問題 4

2つの時間幅を加算する関数を実装してください。2つの時間幅の単位が異なる場合は、情報落ち（精度の損失）を防ぐために、より小さい方の単位に統一して計算してください。

