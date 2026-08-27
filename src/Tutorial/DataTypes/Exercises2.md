# 直和型 練習問題

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/Exercises2.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/Exercises2.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.Exercises2

import Tutorial.DataTypes.SumTypes
```

これらの練習問題の解答は [`src/Solutions/DataTypes.idr`](../../Solutions/DataTypes.md) にあります。

## 練習問題 1

`Title` 型の等値性判定関数を実装してください（2つの `String` の比較には等値演算子 `(==)` を使用できます）：

```idris
total
eqTitle : Title -> Title -> Bool
```

## 練習問題 2

カスタム敬称（`Other`）が使用されているかどうかを判定するシンプルな関数を実装してください：

```idris
total
isOther : Title -> Bool
```

## 練習問題 3

前述のシンプルな `Credentials` 型において、認証が失敗する原因には以下の3通りがあります：

- 不明な（存在しない）ユーザー名が指定された。
- 指定されたパスワードがユーザー名に紐づくものと一致しない。
- 無効な秘密鍵が使用された。

これら3つの可能性を表現する直和型 `LoginError` を定義してください。機密情報が漏洩しないように配慮し、無効なユーザー名自体は対応するエラー値に格納して構いませんが、無効なパスワードや鍵は格納しないようにしてください。

## 練習問題 4

Web アプリケーションへのログインに失敗したユーザーに対してエラーメッセージを表示するための以下の関数を実装してください：

```idris hide
-- Hidden forward declaration to make this module compile so we can have syntax
-- highlighting
data LoginError : Type
```

```idris
total
showError : LoginError -> String
```

<!-- vi: filetype=idris2:syntax=markdown
-->
