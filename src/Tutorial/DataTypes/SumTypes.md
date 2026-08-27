# 直和型 (Sum Types)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/DataTypes/SumTypes.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/DataTypes/SumTypes.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

```idris
module Tutorial.DataTypes.SumTypes 
```

前節で扱ったシンプルな列挙型は、より一般的な **直和型 (sum types)** の最も基本的な形態にすぎません。従来の多くの命令型プログラミング言語では、列挙型があったとしても、その特定の値がどのバリアントであるかという情報しか保持できない基本的な形式のみでした。Idris は他の関数型言語や多くの現代的な命令型言語と同様にさらに一歩進んでおり、型の各バリアントに任意の追加データを保持させることができます。

例として、Web アプリケーションのユーザーに敬称（呼び名）を選択してもらう Web フォームを作成するとします。事前定義された2つの一般的な敬称（Mr と Mrs）の選択肢を用意しつつ、完全に自由なカスタム文字列を入力できるようにしたいとします。この選択肢は、Idris のデータ型として以下のように表現できます：

```idris
public export
data Title = Mr | Mrs | Other String
```

これは前節の列挙型とほぼ同じように見えますが、`Other` の位置に `String` 引数を受け取る **データコンストラクタ (data constructor)** がある点が異なります。

> [!TIP]
> シンプルな列挙型の値も、（引数を取らない）データコンストラクタと呼ばれます。

REPL で型を調べてみると、以下のことがわかります：

```repl
Tutorial.DataTypes.SumTypes> :t Mr
Tutorial.DataTypes.SumTypes.Mr : Title
Tutorial.DataTypes.SumTypes> :t Other
Tutorial.DataTypes.SumTypes.Other : String -> Title
```

REPL が示しているように、`Other` は実際には `String` から `Title` への **関数** です。つまり、`Other` に `String` 引数を渡すことで、結果として `Title` を得ることができます：

```idris
public export
total
dr : Title
dr = Other "Dr."
```

シンプルな列挙型と同様に、`Title` 型の値は上記3つの選択肢のいずれか1つにしかなり得ず、ここでもパターンマッチを使用して `Title` データ型に対する関数を証明可能に全域的な形で実装できます：

```idris
export
total
showTitle : Title -> String
showTitle Mr        = "Mr."
showTitle Mrs       = "Mrs."
showTitle (Other x) = x
```

> [!NOTE]
> 最後のパターンマッチでは、`Other` データコンストラクタに格納されている文字列値がローカル変数 `x` に **束縛 (bound)** されています。また、`Other x` パターンは括弧で囲む必要があります。括弧がない場合、Idris は `Other` と `x` を関数の2つの独立した引数だと解釈してしまいます。
>
> このようなパターンマッチは、データコンストラクタから値を抽出するための非常に一般的な手法です。

`showTitle` を利用して、`Title` と `String` 型の氏名から丁寧な挨拶文を生成する関数を実装してみましょう。文字列リテラルと文字列連結演算子 `(++)` を使用して挨拶文を組み立てます：

```idris
export
total
greet : Title -> String -> String
greet t name = "Hello, " ++ showTitle t ++ " " ++ name ++ "!"
```

REPL での実行結果：

```repl
Tutorial.DataTypes.SumTypes> greet dr "Höck"
"Hello, Dr. Höck!"
Tutorial.DataTypes.SumTypes> greet Mrs "Smith"
"Hello, Mrs. Smith!"
```

`Title` のようなデータ型は、それぞれの構成要素の「和」で構成されているため **直和型 (sum types)** と呼ばれます。`Title` 型の値は、`Mr`、`Mrs`、または `Other` にラップされた `String` のいずれかです。

直和型の別の例（極めて単純化したもの）として、Web アプリケーションで2種類の認証方法を許可したいとします。ユーザー名とパスワード（ここでは符号なし64ビット整数で表現）を入力する方法と、ユーザー名と非常に複雑な秘密鍵（文字列で表現）を入力する方法です。これら2つの選択肢を直和型として以下のように定義できます：

```idris
data Credentials = Password String Bits64 | Key String String
```

この型を使って、既知の資格情報をハードコードしたシンプルなログイン関数を実装できます：

```idris
total
login : Credentials -> String
login (Password "Anderson" 6665443) = greet Mr "Anderson"
login (Key "Y" "xyz")               = greet (Other "Agent") "Y"
login _                             = "Access denied!"
```

> [!NOTE]
> この `login` 関数が示すように、整数リテラルや文字列リテラルを使用してプリミティブ値に対するパターンマッチを行うこともできます。

REPL で `login` を試してみましょう：

```repl
Tutorial.DataTypes.SumTypes> login (Password "Anderson" 6665443)
"Hello, Mr. Anderson!"
Tutorial.DataTypes.SumTypes> login (Key "Y" "xyz")
"Hello, Agent Y!"
Tutorial.DataTypes.SumTypes> login (Key "Y" "foo")
"Access denied!"
```

<!-- vi: filetype=idris2:syntax=markdown
-->
