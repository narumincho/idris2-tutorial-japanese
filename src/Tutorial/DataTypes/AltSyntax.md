# データ定義の別の構文

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/AltSyntax.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/AltSyntax.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.AltSyntax
```

パラメータ化されたデータ型のセクションで紹介した例は短く簡潔でしたが、何が起きているのかをより明示的にする、少し冗長ながらはるかに汎用的な定義の記述形式が存在します。この形式は、最も基本的なデータ定義を除くほぼすべてのケースで好ましいと考えられています。

このより一般的な形式を使って、`Option`、`Validated`、`Seq` を書き直した定義を以下に示します：

```idris
-- GADT は「一般化代数的データ型 (generalized algebraic data type)」のアクロニムです
namespace GADT
  data Option : Type -> Type where
    Some : a -> Option a
    None : Option a

  data Validated : Type -> Type -> Type where
    Invalid : e -> Validated e a
    Valid   : a -> Validated e a

  data Seq : Type -> Type where
    Nil  : Seq a
    (::) : a -> Seq a -> Seq a
```

ここでは、`Option` が型コンストラクタ（`Type -> Type` 型の関数）として明確に宣言され、`Some` は `a -> Option a` 型のジェネリック関数（`a` は型パラメータ）、`None` は `Option a` 型の nullary（引数なし）ジェネリック関数として宣言されています。`Validated` と `Seq` についても同様です。

