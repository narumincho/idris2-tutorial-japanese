# Neovim での対話的編集 (Interactive Editing in Neovim)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Appendices/Neovim.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Appendices/Neovim.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

Idris は、プログラム内の値や式の型を対話的に分析し、提供された型に基づいてスケルトン実装や時にはプログラム全体を自動生成するための強力な機能を提供しています。これらの対話的編集機能は、さまざまなエディタのプラグインを介して利用可能です。筆者は Neovim ユーザーであるため、ここでは自身の設定のうち Idris に関連する部分について詳しく説明します。

Neovim でこれらのすべての機能を利用するために必要な主要コンポーネントは、[idris2-lsp](https://github.com/idris-community/idris2-lsp) プロジェクトによって提供される実行ファイルです。この実行ファイルは内部で Idris コンパイラ API を使用し、作業中のソースコードの構文や型をチェックします。また、Language Server Protocol（LSP）を介して Neovim と通信します。この通信は [idris2-nvim](https://github.com/ShinKage/idris2-nvim) プラグインを通じてセットアップされます。

このチュートリアルで見るように、`idris2-lsp` 実行ファイルは構文や型のチェックだけでなく、追加の対話的編集機能も備えています。さらに、Idris コンパイラ API は Idris ソースコードのセマンティックハイライト（意味論に基づくハイライト）をサポートしています。識別子やキーワードは言語の構文だけでなく、その *セマンティクス（意味論）* に基づいてもハイライトされます。例えば、関数実装内のローカル変数は、構文上はどちらも単なる識別子であっても、トップレベル関数の名前とは異なる色でハイライトされます。

```idris
module Appendices.Neovim

import Data.Vect

%default total
```

## セットアップ (Setup)

Neovim での対話的な Idris 編集をフル活用するには、少なくとも以下のツールがインストールされている必要があります：

- 最新バージョンの Neovim（バージョン 0.5 以降）。
- 最新バージョンの Idris コンパイラ（少なくともバージョン 0.5.1）。
- Idris コンパイラ API。
- [idris2-lsp](https://github.com/idris-community/idris2-lsp) パッケージ。
- 以下の Neovim プラグイン：
  - [idris2-nvim](https://github.com/ShinKage/idris2-nvim)
  - [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)

`idris2-lsp` プロジェクトでは、Idris 2 を標準ライブラリおよびコンパイラ API とともにインストールする方法についての詳細な手順が説明されています。コンパイラと `idris2-lsp` 実行ファイルが同期するように、これらの手順に従ってください。

Neovim に慣れていない場合は、`resources` フォルダにある `init.vim` ファイルを使用するとよいでしょう。その場合、必要な Neovim プラグインはすでに含まれていますが、プラグインマネージャである [vim-plug](https://github.com/junegunn/vim-plug) をインストールする必要があります。その後、`resources/init.vim` のすべてまたは一部を自身の `init.vim` ファイルにコピーしてください（このファイルの場所を確認するには Neovim 内から `:help init.vim` を実行してください）。`init.vim` ファイルを設定したら、Neovim を再起動して `:PlugUpdate` を実行し、必要なプラグインをインストールします。

## 典型的なワークフロー (A Typical Workflow)

利用可能な対話的編集機能を体験するために、*Prelude* のいくつかの小さなユーティリティを再実装してみましょう。ここでの説明を追うには、[はじめに](../Tutorial/Intro.md)、[関数入門](../Tutorial/Functions1.md)、および少なくとも [代数的データ型](../Tutorial/DataTypes.md) の一部をすでに学習している必要があります。

始める前に、ソースファイルを編集した後に変更をディスクに保存（`:w`）していない場合、ここで示すコマンドや操作が正しく動作しないことがある点に注意してください。したがって、記載された内容がうまく動作しない場合は、まず現在のファイルを素早く保存してみてください。

ブール値の否定から始めましょう：

```idris
negate1 : Bool -> Bool
```

通常、Idris コードを書く際は「型が先（types first）」という原則に従います。ある機能をどのように実装するかについてのアイデアがすでにある場合でも、実装を書き始める前に正確な型を提供する必要があります。これは、Idris でプログラミングする際、アルゴリズムの実装と関連する型を同時に頭の中で追跡しなければならないことを意味し、どちらも任意に複雑になり得ます。しかし、本当にそうでしょうか？Idris は関数の現在のコンテキストで利用可能な変数やその型について、私たちと同じかそれ以上に知っています。したがって、すべてを自分で行おうとする代わりに、Idris に指示を仰ぐのが得策です。

実装を進めるために、Idris にスケルトンの関数本体を生成させます。ノーマルモードで `negate1` が宣言されている行にカーソルを合わせ、`<LocalLeader>a` を素早く入力します。`<LocalLeader>` は `init.vim` ファイルで指定できる特別なキーです。`resources` フォルダの `init.vim` を使用している場合はカンマ文字（`,`）に設定されているため、上記のコマンドはカンマに続いて小文字の "a" を素早く入力することになります（Neovim の `:help leader` および `:help localleader` も参照）。

Idris は以下のようなスケルトン実装を生成します：

```idris
negate2 : Bool -> Bool
negate2 x = ?negate2_rhs
```

左辺に `x` という名前の新しい変数が導入され、右辺に Idris が **メタ変数（metavariable / ホールとも呼ばれます）** を追加した点に注目してください。これは先頭にクエスチョンマークが付いた識別子です。これは Idris に対し、この部分の実装は後で行うことを示します。ホールの素晴らしい点は、その上に **カーソルを合わせて（ホバーして）**、その型や周囲のコンテキストにある値の型をインスペクトできることです。ホールの識別子にカーソルを置き、ノーマルモードで大文字の `K` を入力します。これにより、カーソル下の変数の型と、周囲のコンテキストにある変数の型および多重度（quantity）を表示するポップアップが開きます。この情報を別ウィンドウに表示することも可能です。`<LocalLeader>so` を入力してウィンドウを開き、再度ホバーを実行します。情報は新しいウィンドウにセマンティックハイライトされて表示されます。`<LocalLeader>sc` を入力するとこのウィンドウを再び閉じることができます。実際に `?negate2_rhs` の型とコンテキストを確認してみてください。

Idris のほとんどの関数は、1 つ以上の引数に対するパターンマッチによって実装されます。非プリミティブデータ型のすべてのデータコンストラクタを知っている Idris は、そのようなパターンマッチを自動で記述してくれます（この処理は **ケース分割 / case splitting** とも呼ばれます）。これを試すには、`negate2` のスケルトン実装内の `x` にカーソルを合わせ、ノーマルモードで `<LocalLeader>c` を入力します。結果は以下のようになります：

```idris
negate3 : Bool -> Bool
negate3 False = ?negate3_rhs_0
negate3 True = ?negate3_rhs_1
```

右辺の各ケースに対して Idris がホールを挿入したことが分かります。再びそれらの型を確認したり、適切な実装に直接置き換えたりすることができます。

ここまでで、対話的編集の核となる機能（メタ変数へのホバー、スケルトン関数実装の追加、ケース分割）の紹介を終わります。これらは case ブロックやネストしたパターンマッチでも動作します。ぜひ日常的に使い始めてみてください！

## 式探索 (Expression Search)

時には、Idris が関与する型について十分な情報を持っているため、自力で関数の実装を導き出せることがあります。例えば、*Prelude* の `either` 関数を実装してみましょう。型を指定し、スケルトン実装を作成し、`Either` 引数をケース分割すると、以下のような状態になります：

```idris
either2 : (a -> c) -> (b -> c) -> Either a b -> c
either2 f g (Left x) = ?either2_rhs_0
either2 f g (Right x) = ?either2_rhs_1
```

型が十分に具体的であるため、Idris は 2 つのメタ変数に対する式を自力で見つけ出すことができます。いずれかのメタ変数にカーソルを合わせ、ノーマルモードで `<LocalLeader>o` を入力します。候補となる式の一覧が表示されるので（この場合は 1 つだけ）、適切なものを選択します（または `q` でキャンセル）。

別の例として、`maybe` 関数の再実装を見てみましょう。`?maybe2_rhs_1` で式探索を実行すると、より多くの候補一覧が表示されます。

```idris
maybe2 : b -> (a -> b) -> Maybe a -> b
maybe2 x f Nothing = x
maybe2 x f (Just y) = ?maybe2_rhs_1
```

Idris は、関数の型に基づいて完全な関数実装を生成できることもあります。これが実際にうまく機能するためには、型チェッカーを満たす可能な実装の数が非常に少ない必要があります。例として、ベクトルに対する `zipWith` 関数を挙げます。ベクトルについては [依存型](../Tutorial/Dependent.md) の章で紹介されますが、ここでも試すことができます。`zipWithV` を宣言している行にカーソルを合わせ、`<LocalLeader>gd` を入力して最初のオプションを選択します。これにより、ケース分割と実装を含む関数本体全体が自動生成されます。

```idris
zipWithV : (a -> b -> c) -> Vect n a -> Vect n b -> Vect n c
```

式探索は型が十分に具体的な場合にのみうまく機能します。そう思える場面では、メタ変数上で `<LocalLeader>o` を実行するか、関数宣言上で `<LocalLeader>gd` を試してみてください。

## その他のコードアクション (More Code Actions)

コードの一部を生成するための他のショートカットもあり、ここではそのうちの 2 つを説明します。

まず、メタ変数上でノーマルモード時に `<LocalLeader>mc` を入力することで、新しい case ブロックを追加できます。例えば、代数的データ型の章の練習問題にある `filterList` の実装の一部を示します。これはスケルトン実装の生成、ケース分割、最初のメタ変数の式探索によって作成したものです：

```idris
filterList : (a -> Bool) -> List a -> List a
filterList f [] = []
filterList f (x :: xs) = ?filterList_rhs_1
```

次に、`x` に `f` を適用した結果に対してパターンマッチする必要があります。メタ変数 `?filterList_rhs_1` にカーソルを合わせてノーマルモードで `<LocalLeader>mc` を入力すると、Idris が新しい case ブロックを導入してくれます。その後、case ブロックで使用する式（`f x`）を指定し、case ブロック内の新しい変数に対してケース分割を行うことで実装を進めることができます。これにより、以下のような実装が得られます（インデントの修正は必要です）：

```idris
filterList2 : (a -> Bool) -> List a -> List a
filterList2 f [] = []
filterList2 f (x :: xs) = case f x of
  False => ?filterList2_rhs_2
  True => ?filterList2_rhs_3
```

また、作業中の実装からユーティリティ関数を抽出したい場合もあります。例えば、コードに関する証明を書く際にこれはしばしば有用または不可欠になります（[命題的等値性](../Tutorial/Eq.md) や [述語と証明探索](../Tutorial/Predicates.md) の章を参照）。これを行うには、メタ変数にカーソルを合わせ、`<LocalLeader>ml` を入力します。以下の例の `?whatNow` で試してみてください：

```idris
traverseEither : (a -> Either e b) -> List a -> Either e (List b)
traverseEither f [] = Right []
traverseEither f (x :: xs) = ?whatNow x xs f (f x) (traverseEither f xs)
```

Idris は `?whatNow` の型と名前を持つ新しい関数宣言を作成し、現在スコープにあるすべての変数を引数として受け取るようにします。また、`traverseEither` 内のホールをこの新しい関数の呼び出しに置き換えます。通常、その後不要な引数を手動で削除します。これにより以下のバージョンが得られました：

```idris
whatNow2 : Either e b -> Either e (List b) -> Either e (List b)

traverseEither2 : (a -> Either e b) -> List a -> Either e (List b)
traverseEither2 f [] = Right []
traverseEither2 f (x :: xs) = whatNow2 (f x) (traverseEither f xs)
```

## 情報の取得 (Getting Information)

`idris2-lsp` 実行ファイル、およびそれを通じた `idris2-nvim` プラグインは、上記のコードアクションだけでなく多彩な機能をサポートしています。以下はその一部です。このソースファイル内からそれぞれ試してみることをお勧めします。

- 識別子や演算子上でノーマルモード時に `K` を入力すると、その型と名前空間（存在する場合）が表示されます。メタ変数の場合、現在のコンテキストにある変数もその型や多重度とともに表示されます（多重度については [関数 パート2](../Tutorial/Functions2.md) で説明されています）。ポップアップではなく別ウィンドウでセマンティックハイライト表示したい場合は `<LocalLeader>so` を入力します。
- 関数、演算子、データコンストラクタ、型コンストラクタ上でノーマルモード時に `gd` を入力すると、その定義にジャンプします。外部モジュールの場合、対象のモジュールがソースコード付きでインストールされている場合にのみ機能します（`idris2 --install-with-src` コマンドを使用）。
- `<LocalLeader>mm` を入力すると、現在のモジュール内のすべてのメタ変数を一覧表示するポップアップウィンドウが開きます。エントリにカーソルを合わせて `<Enter>` を押すと、その場所にジャンプできます。
- `<LocalLeader>mn`（または `<LocalLeader>mp`）を入力すると、現在のモジュール内の次（または前）のメタ変数にジャンプします。
- `<LocalLeader>br` を入力すると、名前空間を入力できるポップアップが開きます。Idris はその名前空間からエクスポートされたすべての関数（およびその型）をポップアップウィンドウに表示し、エントリ上で Enter を押すことで関数の定義にジャンプできます（対象のモジュールが現在のソースファイルでインポートされている必要があります）。
- `<LocalLeader>x` を入力するとポップアップが開き、REPL コマンドや Idris の式を入力するとプラグインが REPL からの応答を返します。チュートリアル本文で REPL の例が表示されているときは、Neovim 内からこのショートカットで試すことができます。
- `<LocalLeader><LocalLeader>e` を入力すると、現在の行のエラーメッセージがポップアップウィンドウに表示されます。エラーメッセージが長すぎて 1 行に収まらない場合に非常に便利です。同様に、`<LocalLeader><LocalLeader>el` は現在のバッファのすべてのエラーメッセージを新しいウィンドウに一覧表示します。エラーメッセージを選択して `<Enter>` を押すと、その発生場所にジャンプできます。

その他のユースケースや例は `idris2-nvim` プラグインの GitHub ページで説明されています。

## `%name` ディレクティブ (The `%name` Pragma)

`<LocalLeader>a` でスケルトン実装を要求したり、`<LocalLeader>c` でケース分割を行ったりする際、Idris は新しく導入する変数にどのような名前を使用するかを決定する必要があります。これらの変数がすでに定義済みの名前を持っている場合（関数のシグネチャ、レコードフィールド、名前付きデータコンストラクタ引数など）、それらの名前が使用されますが、そうでない場合、Idris はデフォルトで `x`、`y`、`z` のような名前を使用します。任意のデータ型に対して、このような場合に使用する名前のリストを指定することで、このデフォルトの動作を変更できます。

例えば：

```idris
data Element = H | He | C | N | O | F | Ne

%name Element e,f
```

これにより、Idris はこの型の変数名を自力で決定する際に、これらの名前（およびその後に連番を付加した名前）を使用するようになります。例えば、以下はテスト関数と、それにスケルトン定義を追加した結果です：

```idris
test : Element -> Element -> Element -> Element -> Element -> Element
test e f e1 f1 e2 = ?test_rhs
```

## おわりに (Conclusion)

Neovim は、`idris2-lsp` 実行ファイルおよび `idris2-nvim` プラグインと組み合わせることで、Idris でプログラミングする際の強力な対話的編集ユーティリティを提供します。他のいくつかのエディタでも同様の機能が利用可能ですので、お好みのエディタで利用可能なものについて [Idris 2 Discord チャンネル](https://discord.gg/UX68fDs2jc) などで気軽に尋ねてみてください。

<!-- vi: filetype=idris2:syntax=markdown
-->
