# pack と Idris 2 の導入手順 (Getting Started with pack and Idris2)

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Appendices/Install.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Appendices/Install.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

ここでは、Idris 2 を使い始めるにあたって最も便利だと考える方法を説明します。[pack](https://github.com/stefan-hoeck/idris2-pack) パッケージマネージャをインストールすることで、最新バージョンの Idris コンパイラも同時にインストールされます。ただし、これには Linux や macOS などの Unix 系オペレーティングシステムが必要です。Windows ユーザーは [WSL](https://learn.microsoft.com/ja-jp/windows/wsl/about) を利用して Linux 環境を用意することができます。

前提条件として、システム上でターミナルセッションを起動し、コマンドラインからコマンドを実行する方法を知っていることを前提としています。さらに、システムの [`$PATH` 環境変数](<https://ja.wikipedia.org/wiki/PATH_(%E7%92%B0%E5%A2%83%E5%A4%89%E6%95%B0)>) にディレクトリを追加する方法を知っている必要があります。

## pack のインストール (Installing pack)

*pack* パッケージマネージャと最新バージョンの Idris 2 コンパイラをインストールするには、[pack の GitHub ページ](https://github.com/stefan-hoeck/idris2-pack/blob/main/INSTALL.md) の手順に従ってください。

すべて順調に完了したら、グローバルの `pack.toml` ファイルで利用可能なデフォルト設定を確認してみることをお勧めします。このファイルは `$XDG_CONFIG_HOME/pack/pack.toml` にあります（`$PACK_USER_DIR` 環境変数を明示的に別のディレクトリに設定していない場合）。可能であれば、*rlwrap* ツールをインストールし、グローバルの `pack.toml` ファイルの以下の設定を `true` に変更することをお勧めします：

```toml
repl.rlwrap = true
```

これにより、REPL セッションの使い勝手が向上します。また、Idris が提供する対話的編集機能を利用するためにエディタを設定することもできます。Neovim 向けの設定手順は [こちら](Neovim.md) にあります。

### pack と Idris の更新 (Updating pack and Idris)

pack と Idris コンパイラはどちらも現在も活発に開発が進められています。そのため、定期的に更新することをお勧めします。pack 自体を更新するには、以下のコマンドを実行します：

```sh
pack update
```

Idris コンパイラの最新コミットをビルド・インストールし、最新のパッケージコレクションを使用するには、以下を実行します：

```sh
pack switch latest
```

## プレイグラウンド（練習用プロジェクト）の設定 (Setting up your Playground)

本チュートリアルの練習問題を解く場合（ぜひ解いてみてください！）、多くのコードを書くことになります。Idris で色々試すための小さなプレイグラウンド用プロジェクトを用意するのが最適です。任意のディレクトリで以下のコマンドを実行してください：

```sh
pack new lib tut
```

これにより、`tut` ディレクトリ内に最小限の Idris パッケージが作成され、`tut.ipkg` という名前の `.ipkg` ファイル、Idris ソースを配置する `src` ディレクトリ、および `src/Tut.idr` に最小限の Idris モジュールがセットアップされます。

さらに、`test` ディレクトリに最小限のテストスイートもセットアップされます。これらすべてがまとめられ、プロジェクトのルートディレクトリにある `pack.toml` ファイルによって pack からアクセス可能になります。pack によって作成された各ファイルの内容を少し時間を取って確認してみてください：
- `.idr` ファイルには Idris のソースコードが含まれます。
- `.ipkg` ファイルには、ソースの配置場所、パッケージが他のプロジェクトに公開するモジュール、プロジェクト自体が依存するパッケージのリストなど、Idris コンパイラ向けの詳細なパッケージ記述が含まれます。
- `pack.toml` ファイルは、現在のプロジェクト内のローカルパッケージについて pack に伝えます。

これを使って実行できる操作をいくつか紹介します。ただし、これらのコマンドを実行する際は、プロジェクトのルートディレクトリ（指示に従った場合は `tut`）またはその子フォルダにいることを確認してください。

ライブラリのソースの型チェックを行うには：

```sh
pack typecheck tut
```

テストスイートをビルドして実行するには：

```sh
pack test tut
```

`src/Tut.idr` を読み込んだ状態で REPL セッションを開始するには：

```sh
pack repl src/Tut.idr
```

## おわりに (Conclusion)

この短い付録では、Idris プロジェクトで作業し、チュートリアルのメインパートを進めるための環境をセットアップしました。これで [最初の章](../Tutorial/Intro.md) を開始する準備が整いました。すでに Idris コードを書いたことがある場合は、[Idris プロジェクトの構成方法](Projects.md) でモジュールシステムの詳細を学ぶこともできます。

なお、本チュートリアル自体も pack プロジェクトとして構成されています。ルートディレクトリに `pack.toml` と `tutorial.ipkg` ファイルがあり（どのような構成になっているか確認してみてください）、`src` ディレクトリのサブフォルダに多数の Idris ソースが含まれています。

