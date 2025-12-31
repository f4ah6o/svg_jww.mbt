# jww-parser-mbt

MoonBitで実装されたJWWファイルパーサーとDXFコンバーターです。JW_CAD形式のファイル（*.jww）をWebブラウザで表示するためのツールキットを提供します。

## 特徴

* **JWWファイルパーシング**: JW_CAD形式のバイナリファイルを解析
* **SVGレンダリング**: JWWデータをSVG形式に変換して表示
* **インタラクティブビューア**:
  * ズームイン/アウト（マウスホイール、キーボードショートカット）
  * パン（マウスドラッグ）
  * フィット（表示範囲自動調整）
* **レイヤーパネル**:
  * レイヤーの表示/非表示切り替え
  * レイヤーごとのエンティティ数表示
* **テキスト機能**:
  * テキストのドラッグ移動
  * フォントサイズ調整
  * テキスト位置リセット

## 技術スタック

* **MoonBit**: メインプログラミング言語（WebAssemblyターゲット対応）
* **TypeScript**: 型定義ファイル
* **Rolldown**: 高速バンドラー（ESM/CJS出力対応）
* **Vite**: 開発用デモアプリケーション

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/f4ah6o/jww_parser.mbt.git
cd svg_jww

# 依存関係のインストール
pnpm install
```

## ビルド

```bash
# クリーンビルド
pnpm run clean

# MoonBitコードのビルド
pnpm run build:moon

# バンドル
pnpm run build:bundle

# TypeScript型定義のコピー
pnpm run build:types

# 全てまとめてビルド
pnpm run build
```

## 使用方法

### デモアプリケーション

```bash
# examplesディレクトリで開発サーバーを起動
cd examples
pnpm dev

# ブラウザで http://localhost:5173 にアクセス
```

デモアプリでは以下の操作が可能です：

* **ファイル選択**: `.jww`ファイルを選択またはドラッグ&ドロップ
* **ズーム**: `+`/`-`ボタン、マウスホイール、またはキーボードの`+`/`-`
* **パン**: SVG上でマウスドラッグ
* **フィット**: `Fit`ボタンまたはキーボードの`F`
* **リセット**: `Reset`ボタンまたは`Ctrl+R`
* **レイヤー切り替え**: 右側のレイヤーパネルでチェックボックス操作
* **テキスト編集**:
  * `Text`チェックボックスでテキスト機能のオン/オフ
  * テキストをドラッグして位置移動
  * `Size`スライダーでフォントサイズ調整
  * `Reset Text`ボタンで位置リセット

### ライブラリとして使用

```javascript
import { parse } from 'jww-parser-mbt';

// JWWファイルをパース
const buffer = await file.arrayBuffer();
const uint8Array = new Uint8Array(buffer);
const jwwData = parse(uint8Array);

// パース結果を処理
console.log(jwwData.entities);
```

## プロジェクト構造

```
svg_jww/
├── cmd/                   # エントリーポイント
│   ├── browser/          # ブラウザ用
│   └── main/             # CLI用
├── svg_jww_ui/           # UIコンポーネント（MoonBit）
│   ├── app.mbt           # メインアプリケーション
│   ├── canvas.mbt        # SVGキャンバス
│   ├── layer_panel.mbt   # レイヤーパネル
│   └── state.mbt         # 状態管理
├── svg_jww.mbt           # メインモジュール
├── svg_jww_renderer.mbt  # レンダリングロジック
├── svg_jww_types.mbt     # 型定義
├── examples/             # デモアプリケーション
│   ├── src/main.js       # メイン処理
│   └── index.html        # HTMLテンプレート
└── package/              # npmパッケージ設定
    └── package.json
```

## ライセンス

AGPL-3.0

## 作者

f12o

## リポジトリ

https://github.com/f4ah6o/jww_parser.mbt.git
