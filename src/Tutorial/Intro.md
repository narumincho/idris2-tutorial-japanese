# はじめに

> 🌐 **翻訳元:** [idris-community/idris2-tutorial/src/Tutorial/Intro.md](https://github.com/idris-community/idris2-tutorial/blob/main/src/Tutorial/Intro.md)  
> 🤖 **翻訳:** Gemini 3.7 Flash

[本書を構成する](https://github.com/idris-community/idris2-tutorial) Markdown ファイルの多く（拡張子が `.md` のもの）は、Markdown と Idris コードが混在した「文芸的 (literate) Idris」ファイルです。これらは通常のコードと同様に Idris コンパイラによって型チェックされ、ビルドされます。ドキュメントが文芸的 Idris ファイルであるかどうかは、以下のように `module` 宣言が含まれているかどうかで判別できます：

```idris
module Tutorial.Intro
```

このファイル（`src/Tutorial/Intro.md`）には実際の関数定義コードは含まれていませんが、この `module` 宣言を含めることで文芸的 Idris ファイルとして扱われます。モジュール名はドットで区切られた識別子のリストで構成され、ソースディレクトリからのフォルダ構造とモジュールファイル名を反映している必要があります。たとえば、このファイルの `src` ディレクトリからの相対パスは `Tutorial/Intro.md` であるため、モジュール名は必ず `Tutorial.Intro` でなければなりません。

本書を読み始める前に、お手元のコンピュータに Idris コンパイラがインストールされていることを確認してください。コンパイラがなくても読み進めることは可能ですが、本書では [pack と Idris 2 の導入手順](../Appendices/Install.md) の付録で説明されているように、パッケージマネージャ _pack_ をインストールし、スケルトンパッケージをセットアップしていることを前提としています。

本書を読み進めると、さまざまな練習問題が登場します。これらの問題の解答は、[Git リポジトリ](https://github.com/idris-community/idris2-tutorial/tree/main/src/Solutions) の `src/Solutions` ディレクトリにある通常の Idris ファイルとして参照できるほか、ナビゲーションサイドバー下部の「練習問題の解答」セクションからシンタックスハイライト付きで確認することもできます。

<!-- vi: filetype=idris2:syntax=markdown
-->
