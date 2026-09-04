# `IO` の実装の仕組み

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/IO/Impl.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/IO/Impl.md)  
> 🤖 **翻訳:** Gemini 3.8 Flash

すでに長くなった本章の最後に、Idris で `IO` が内部的にどのように実装されているかを少し覗いてみましょう。興味深いことに、`IO` はコンパイラ組み込みの魔法の型ではなく、ほんの少しの特殊性を持つ通常のデータ型です。REPL で確認してみましょう：

```repl
Tutorial.IO> :doc IO
data PrimIO.IO : Type -> Type
  Totality: total
  Constructor: MkIO : (1 _ : PrimIO a) -> IO a
  Hints:
    Applicative IO
    Functor IO
    HasLinearIO IO
    Monad IO
```

ここから、`IO` には単一のデータコンストラクタ `MkIO` があり、多重度 *1* を持つ `PrimIO a` 型の単一引数を取ることがわかります。ここでは多重度については気にしなくて構いません。`IO` がどのように機能するかを理解する上で本質的ではないためです。

さて、`PrimIO a` は以下の関数の型エイリアスです：

```repl
Tutorial.IO> :printdef PrimIO
PrimIO.PrimIO : Type -> Type
PrimIO a = (1 _ : %World) -> IORes a
```

ここでも多重度は気にしないでください。パズルの最後のピースは `IORes a` です。これは公開されているレコード型です：

```repl
Solutions.IO> :doc IORes
data PrimIO.IORes : Type -> Type
  Totality: total
  Constructor: MkIORes : a -> (1 _ : %World) -> IORes a
```

これらすべてをまとめると、`IO` は実質的に以下のような関数型のラッパーに過ぎません：

```repl
%World -> (a, %World)
```

型 `%World` は、プログラムの外の世界の状態（ファイルシステム、メモリ、ネットワーク接続など）を表すプレースホルダーと考えることができます。概念的には、`IO a` アクションを実行するには現在の「世界の状態」を渡し、その見返りとして「更新された世界の状態」と `a` 型の結果を受け取ります。世界の状態が更新されることが、コンピュータプログラムで記述可能なすべての副作用を表しています。

もちろん、「世界の状態」という物理的な実体が存在するわけではないことを理解することが重要です。`%World` 型は単なるプレースホルダーであり、実行時には単に受け渡されるだけで中身が決して検査されない定数に変換されます。もし `%World` 型の値を持っていれば、それを `IO a` アクションに渡して実行することができます。そして、これこそが実行時に行われていることです：`%World` 型の単一の値（`null`, `0`, JavaScript バックエンドの場合は `undefined` などのダミー値）が `main` 関数に渡され、プログラム全体の実行が開始されます。しかし、コード上で `%World` 型の値を新しく作成することは不可能です（抽象的でプリミティブな型です）。そのため、`IO a` アクションから `a` 型の値を取り出すことは（`unsafePerformIO` を除いて）決してできません。

後にモナド変換子や State モナドについて学ぶと、`IO` は「プログラマが直接実行できないように状態型が隠蔽（抽象化）された State モナド」に他ならないことがわかるでしょう。

<!-- vi: filetype=idris2:syntax=markdown
-->
