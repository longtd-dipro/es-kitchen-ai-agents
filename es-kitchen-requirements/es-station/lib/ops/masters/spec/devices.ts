import type { MasterSpec } from '../types';

/* 機種マスタ一覧・機種の詳細の項目（元：部品/13_運営_機種プランマスタ.html の #s-mdl・#s-md。scripts で取り出したもの） */
export const DEVICES_SPEC: MasterSpec = {
 "kind": "devices",
 "list": {
  "noun": "機種",
  "title": "機種マスタ一覧",
  "crumb0": "マスタ管理",
  "crumbCur": "機種マスタ",
  "search": [
   {
    "t": "in",
    "keys": "id,name",
    "ph": "機種ID、機種名",
    "cls": "es-field es-grow"
   },
   {
    "t": "sel",
    "keys": "kind",
    "label": "機種区分",
    "o": [
     "冷蔵庫",
     "冷凍庫",
     "自販機",
     "電子レンジ",
     "ホットウォーマー",
     "資材ボックス"
    ],
    "cls": "es-field"
   },
   {
    "t": "sel",
    "keys": "maker",
    "label": "メーカー",
    "o": [
     "ホシザキ",
     "フクシマガリレイ",
     "富士電機",
     "パナソニック",
     "アンナカ"
    ],
    "cls": "es-field"
   },
   {
    "t": "sel",
    "keys": "pubst",
    "label": "公開ステータス",
    "o": [
     "公開",
     "非公開"
    ],
    "cls": "es-field"
   },
   {
    "t": "sel",
    "keys": "status",
    "label": "有効状態",
    "o": [
     "有効",
     "無効",
     "削除済"
    ],
    "cls": "es-field"
   }
  ],
  "cols": [
   {
    "text": "機種ID"
   },
   {
    "text": "機種名"
   },
   {
    "text": "機種区分"
   },
   {
    "text": "メーカー"
   },
   {
    "text": "月額料金（税抜）",
    "cls": "r"
   },
   {
    "text": "最低利用期間"
   },
   {
    "text": "公開ステータス"
   },
   {
    "text": "有効状態"
   },
   {
    "text": "貸出中"
   },
   {
    "text": "登録日時"
   },
   {
    "text": "操作"
   }
  ],
  "tdcls": {
   "id": "es-mono",
   "fee": "es-num r"
  },
  "keys": [
   "id",
   "name",
   "kind",
   "maker",
   "fee",
   "term",
   "pubst",
   "status",
   "n",
   "at"
  ],
  "info": "一覧は ES Kitchen の共通パターン（一覧＋詳細・編集）です。IDのリンクで詳細、鉛筆で編集を開きます。ゴミ箱で削除確認、「新規登録」で新規登録の画面に移ります。削除は論理削除で、行は「削除済」として一覧に残ります。<b>デモのため、どの行を開いても中身はサンプル（RF000001）です。</b>（2026/09/28 追加）"
 },
 "detail": {
  "crumb": "マスタ管理 / 機種マスタ / 機種マスタ編集",
  "title": "機種マスタ編集",
  "pid": "RF000001",
  "sum": [
   {
    "label": "機種ID",
    "value": "RF000001",
    "corp": "1"
   },
   {
    "label": "機種名",
    "value": "冷蔵ショーケース 48L",
    "corp": "1"
   },
   {
    "label": "機種区分",
    "value": "冷蔵庫",
    "corp": "1"
   },
   {
    "label": "メーカー",
    "value": "ホシザキ",
    "corp": "1"
   },
   {
    "label": "月額料金（税抜き）",
    "value": "5,000円",
    "corp": "1"
   },
   {
    "label": "最低利用期間",
    "value": "3ヶ月",
    "corp": "1"
   },
   {
    "label": "最大収納数",
    "value": "50個",
    "corp": "1"
   },
   {
    "label": "公開ステータス",
    "value": "公開",
    "corp": "1"
   },
   {
    "label": "貸出中",
    "value": "96台",
    "corp": "0"
   }
  ],
  "tabs": [
   {
    "id": "md-0",
    "label": "基本情報",
    "corp": "0"
   },
   {
    "id": "md-1",
    "label": "料金・契約条件",
    "corp": "0"
   },
   {
    "id": "md-2",
    "label": "貸出・履歴",
    "corp": "0"
   }
  ],
  "panes": [
   {
    "id": "md-0",
    "cards": [
     {
      "title": "基本情報",
      "blocks": [
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-0/機種ID",
          "name": "機種ID",
          "label": "機種ID",
          "ctl": [
           {
            "t": "in",
            "ro": 1
           }
          ],
          "v": [
           "RF000001"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "機種区分の2文字 ＋6桁。<b>RF＝冷蔵庫、FZ＝冷凍庫（2026/09/23 決定 ⑫-3 で分離）</b>、VM＝自販機、MW＝電子レンジ、HW＝ホットウォーマー、BX＝資材ボックス（P2で追加）。【既存の冷凍機種は振り直す：RF000005→FZ000001／RF000006→FZ000002／RF000007→FZ000003。Phase2 開発前のため移行データなし】【シリアル番号ではなくシステム管理用】個体番号は拠点の貸出一覧が持つ。【現行画面の冷蔵庫の例では、欄が RC000001・見出しが RF000001 と食い違っている（要確認）】",
          "meta": "<code>model.no</code>　varchar(20)",
          "corp": "0",
          "ro": "1",
          "rop": "1",
          "na": "0",
          "edit": "0",
          "mi": 0
         },
         {
          "k": "md-0/機種名",
          "name": "機種名",
          "label": "機種名",
          "ctl": [
           {
            "t": "in"
           }
          ],
          "v": [
           "冷蔵ショーケース 48L"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "例：冷蔵ショーケース 84L（2026/09/29 冷蔵庫4機種。旧例：業務用冷凍冷蔵庫 RF-1200）。申込画面・契約画面・請求書の設備名に使う",
          "meta": "<code>model.name</code>　varchar(80)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/機種名フリガナ",
          "name": "機種名フリガナ",
          "label": "機種名フリガナ",
          "ctl": [
           {
            "t": "in"
           }
          ],
          "v": [
           "レイゾウショーケース 48L"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "カタカナ（型番の英数字はそのまま）。【現行画面の表記は「機種名カナ」。用語をフリガナに揃える】",
          "meta": "<code>model.name_kana</code>　varchar(120)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/有効状態",
          "name": "有効状態",
          "label": "有効状態",
          "ctl": [
           {
            "t": "sel",
            "o": [
             "有効",
             "無効"
            ]
           }
          ],
          "v": [
           "有効"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "有効／無効。無効にしても、すでに貸し出している設備はそのまま。新規に選べなくなるだけ。【現行画面で見えるのは「有効」だけ。ほかの選択肢は要確認】",
          "meta": "<code>model.status</code>　varchar(12)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/公開ステータス",
          "name": "公開ステータス",
          "label": "公開ステータス",
          "ctl": [
           {
            "t": "sel",
            "o": [
             "公開",
             "非公開"
            ]
           }
          ],
          "v": [
           "公開"
          ],
          "req": "req",
          "tags": [
           [
            "pn",
            "P2新"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "公開／非公開。【2026/10/01 統一（回答 P1）】旧「公開区分」（法人Webの申込に出す／運営だけが選べる）と同じ意味のため、この「公開ステータス」1つにまとめた。法人Webの申込・変更の設備一覧（「追加でご希望の設備」）に出すのは「公開」の機種だけ。「非公開」は運営だけが選べる（顧客画面に出ない）。すでに貸出中の設備はそのまま。同じサイズ（機種区分）で複数の機種を「公開」にすると申込の欄が増えるため、「公開」にするのは各サイズ1機種だけにする。オプションマスタ・値引きマスタ・プランマスタも同じ「公開ステータス」。【要確認：自販機のように金額を出さない機種を申込に出すとき「別途見積」と表示するか。公開／非公開の2つのままでよいか】",
          "meta": "<code>model.public_status</code>　varchar(12)　（旧 model.visibility を統合）",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "newf": 1,
          "mi": 0
         },
         {
          "k": "md-0/申込での最大台数",
          "name": "申込での最大台数",
          "label": "申込での最大台数",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "台まで"
             }
            ]
           }
          ],
          "v": [
           "3"
          ],
          "req": "cond",
          "tags": [
           [
            "pn",
            "P2新"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "【2026/09/18 追加】1拠点あたり何台まで法人Webから申し込めるか。例：冷蔵庫3・電子レンジ2・資材ボックス9。超えた分は「担当者へご相談ください」にする",
          "meta": "<code>model.form_max_qty</code>　smallint",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "newf": 1,
          "mi": 0
         },
         {
          "k": "md-0/機種備考",
          "name": "機種備考",
          "label": "機種備考",
          "ctl": [
           {
            "t": "ta",
            "rows": 2
           }
          ],
          "v": [
           ""
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "例：高出力・連続使用対応",
          "meta": "<code>model.note</code>　text",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         }
        ]
       }
      ],
      "corp": "0"
     },
     {
      "title": "規格・サイズ",
      "blocks": [
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-0/幅",
          "name": "幅",
          "label": "幅",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "mm"
             }
            ]
           }
          ],
          "v": [
           "1,200"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "mm。搬入経路の判断に使う",
          "meta": "<code>model.width_mm</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/奥行",
          "name": "奥行",
          "label": "奥行",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "mm"
             }
            ]
           }
          ],
          "v": [
           "800"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "mm",
          "meta": "<code>model.depth_mm</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/高さ",
          "name": "高さ",
          "label": "高さ",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "mm"
             }
            ]
           }
          ],
          "v": [
           "1,950"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "mm",
          "meta": "<code>model.height_mm</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/重量",
          "name": "重量",
          "label": "重量",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "kg"
             }
            ]
           }
          ],
          "v": [
           "130.0"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "kg。床の耐荷重・搬入の判断に使う",
          "meta": "<code>model.weight_kg</code>　numeric(6,1)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/容量",
          "name": "容量",
          "label": "容量",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "L"
             }
            ]
           }
          ],
          "v": [
           "48"
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "L",
          "meta": "<code>model.capacity_l</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/電源",
          "name": "電源",
          "label": "電源",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "V"
             }
            ]
           }
          ],
          "v": [
           "100-200"
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "V。例：100／100-200",
          "meta": "<code>model.power_v</code>　varchar(20)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-0/消費電力",
          "name": "消費電力",
          "label": "消費電力",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "W"
             }
            ]
           }
          ],
          "v": [
           "400"
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "W。設置場所のコンセントの確認に使う",
          "meta": "<code>model.watt</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         }
        ]
       }
      ],
      "corp": "0"
     },
     {
      "title": "機種写真",
      "blocks": [
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-0/機種写真",
          "name": "機種写真",
          "label": "機種写真",
          "ctl": [
           {
            "t": "photos"
           }
          ],
          "v": [
           0
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "複数枚登録できる。「写真を追加」で足し、写真にカーソルを当てると表示・削除のボタンが出る。申込画面と搬入経路の確認に使う",
          "meta": "<code>model_photo.file</code>　varchar(255)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "style": "grid-column:span 2"
         },
         {
          "k": "md-0/メイン写真",
          "name": "メイン写真",
          "label": "メイン写真",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "mainphoto"
             }
            ]
           }
          ],
          "v": [],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "登録した写真のうち1枚をラジオボタンで選ぶ。一覧・申込画面にはメインの写真を出す",
          "meta": "<code>model_photo.is_main</code>　boolean",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1"
         }
        ]
       }
      ],
      "corp": "0"
     },
     {
      "title": "機種区分",
      "blocks": [
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-0/機種区分",
          "name": "機種区分",
          "label": "機種区分",
          "ctl": [
           {
            "t": "sel",
            "o": [
             "冷蔵庫",
             "冷凍庫",
             "自販機",
             "電子レンジ",
             "ホットウォーマー",
             "資材ボックス"
            ],
            "kubun": 1
           }
          ],
          "v": [
           "冷蔵庫"
          ],
          "req": "req",
          "tags": [
           [
            "pv",
            "P1→P2変"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "<b>冷蔵庫／冷凍庫</b>（2026/09/23 決定 ⑫-3 で2区分に分離）／自販機／電子レンジ／ホットウォーマー／【資材ボックス（P2で追加）】。選ぶと下に区分ごとの欄が出る（ほかの区分の見出しは薄く表示され、選べない）。機種IDの接頭辞もここで決まる（冷蔵庫＝RF／冷凍庫＝FZ）。【分離の理由】区分が1つだと「入れ替えできる機種」を機種マスタだけで決められず、無料対象のサイズ判定もできなかったため",
          "meta": "<code>model.category</code>　varchar(20)",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "chgf": 1,
          "mi": 0
         }
        ]
       },
       {
        "t": "ktabs",
        "o": [
         "冷蔵庫",
         "冷凍庫",
         "自販機",
         "電子レンジ",
         "ホットウォーマー",
         "資材ボックス"
        ]
       },
       {
        "t": "kpanel",
        "k": "冷蔵庫",
        "blocks": [
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:冷蔵庫/冷蔵庫／冷凍庫メーカー",
            "name": "冷蔵庫／冷凍庫メーカー",
            "label": "冷蔵庫／冷凍庫メーカー",
            "ctl": [
             {
              "t": "sel",
              "o": [
               "ホシザキ",
               "パナソニック",
               "フクシマガリレイ"
              ]
             }
            ],
            "v": [
             "ホシザキ"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝冷蔵庫／冷凍庫 のとき】ドロップダウン。その区分のときは必須。例：ホシザキ。【選択肢の中身と持ち方（メーカーマスタか固定値か）は要確認】",
            "meta": "<code>model.maker</code>　varchar(60)",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:冷蔵庫/棚数",
            "name": "棚数",
            "label": "棚数",
            "ctl": [
             {
              "t": "in"
             }
            ],
            "v": [
             "6"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝冷蔵庫／冷凍庫 のとき】例：6",
            "meta": "<code>model.shelf_count</code>　smallint",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:冷蔵庫/最大収納数（冷蔵庫／冷凍庫）",
            "name": "最大収納数（冷蔵庫／冷凍庫）",
            "label": "最大収納数（冷蔵庫／冷凍庫）",
            "ctl": [
             {
              "t": "box",
              "tag": "div",
              "cls": "num",
              "kids": [
               {
                "t": "in",
                "style": "width:80px"
               },
               {
                "t": "txt",
                "tag": "span",
                "cls": "unit",
                "text": "個"
               }
              ]
             }
            ],
            "v": [
             "50"
            ],
            "req": "req",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝冷蔵庫／冷凍庫 のとき】何個入るか。例：300。法人申込フォームのサイズ選択で「ご契約の食数が入るか」の判定に使う。<b>（2026/09/23 決定 ⑫-2）冷蔵庫・冷凍庫・自動販売機は必須。電子レンジ・ホットウォーマー・資材ボックスは持たない（資材ボックスは 2026/09/29 に外した・28-162）。</b>判定に使う数は 冷蔵庫＝冷蔵の1回の納品数（冷蔵・常温の月次提供数上限 ÷ 冷蔵の標準の配送回数）、冷凍庫＝冷凍の1回の納品数（冷凍の月次提供数上限 ÷ 冷凍の標準の配送回数。2026/09/29 決定 28-154・28-155。旧：ES食数 × 冷凍の割合 30%）（決定 ⑬）",
            "meta": "<code>model.max_items</code>　integer",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           }
          ]
         }
        ]
       },
       {
        "t": "kpanel",
        "k": "冷凍庫",
        "blocks": [
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:冷凍庫/冷蔵庫／冷凍庫メーカー",
            "name": "冷蔵庫／冷凍庫メーカー",
            "label": "冷蔵庫／冷凍庫メーカー",
            "ctl": [
             {
              "t": "sel",
              "o": [
               "ホシザキ",
               "パナソニック",
               "フクシマガリレイ"
              ]
             }
            ],
            "v": [
             "ホシザキ"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝冷蔵庫／冷凍庫 のとき】ドロップダウン。その区分のときは必須。例：ホシザキ。【選択肢の中身と持ち方（メーカーマスタか固定値か）は要確認】",
            "meta": "<code>model.maker</code>　varchar(60)",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:冷凍庫/棚数",
            "name": "棚数",
            "label": "棚数",
            "ctl": [
             {
              "t": "in"
             }
            ],
            "v": [
             "6"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝冷蔵庫／冷凍庫 のとき】例：6",
            "meta": "<code>model.shelf_count</code>　smallint",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:冷凍庫/最大収納数（冷蔵庫／冷凍庫）",
            "name": "最大収納数（冷蔵庫／冷凍庫）",
            "label": "最大収納数（冷蔵庫／冷凍庫）",
            "ctl": [
             {
              "t": "box",
              "tag": "div",
              "cls": "num",
              "kids": [
               {
                "t": "in",
                "style": "width:80px"
               },
               {
                "t": "txt",
                "tag": "span",
                "cls": "unit",
                "text": "個"
               }
              ]
             }
            ],
            "v": [
             "50"
            ],
            "req": "req",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝冷蔵庫／冷凍庫 のとき】何個入るか。例：300。法人申込フォームのサイズ選択で「ご契約の食数が入るか」の判定に使う。<b>（2026/09/23 決定 ⑫-2）冷蔵庫・冷凍庫・自動販売機は必須。電子レンジ・ホットウォーマー・資材ボックスは持たない（資材ボックスは 2026/09/29 に外した・28-162）。</b>判定に使う数は 冷蔵庫＝冷蔵の1回の納品数（冷蔵・常温の月次提供数上限 ÷ 冷蔵の標準の配送回数）、冷凍庫＝冷凍の1回の納品数（冷凍の月次提供数上限 ÷ 冷凍の標準の配送回数。2026/09/29 決定 28-154・28-155。旧：ES食数 × 冷凍の割合 30%）（決定 ⑬）",
            "meta": "<code>model.max_items</code>　integer",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           }
          ]
         }
        ]
       },
       {
        "t": "kpanel",
        "k": "自販機",
        "blocks": [
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:自販機/自販機メーカー",
            "name": "自販機メーカー",
            "label": "自販機メーカー",
            "ctl": [
             {
              "t": "sel",
              "o": [
               "富士電機",
               "サンデン・リテールシステム"
              ]
             }
            ],
            "v": [
             "富士電機"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝自販機 のとき】ドロップダウン。その区分のときは必須。例：富士電機。【選択肢は要確認】",
            "meta": "<code>model.maker</code>　varchar(60)",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:自販機/キャッシュレス対応",
            "name": "キャッシュレス対応",
            "label": "キャッシュレス対応",
            "ctl": [
             {
              "t": "box",
              "tag": "div",
              "cls": "chk",
              "kids": [
               {
                "t": "box",
                "tag": "label",
                "cls": "",
                "kids": [
                 {
                  "t": "ck",
                  "type": "radio"
                 },
                 {
                  "t": "txt",
                  "text": "対応する"
                 }
                ]
               },
               {
                "t": "box",
                "tag": "label",
                "cls": "",
                "kids": [
                 {
                  "t": "ck",
                  "type": "radio"
                 },
                 {
                  "t": "txt",
                  "text": "非対応"
                 }
                ]
               }
              ]
             }
            ],
            "v": [
             true,
             false
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝自販機 のとき】対応する／非対応",
            "meta": "<code>model.cashless</code>　boolean",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1"
           },
           {
            "k": "kp:自販機/段数（行）",
            "name": "段数（行）",
            "label": "段数（行）",
            "ctl": [
             {
              "t": "in"
             }
            ],
            "v": [
             "6"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝自販機 のとき】レイアウトの行数（A, B, C…）。例：6",
            "meta": "<code>model.vm_rows</code>　smallint",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:自販機/列数",
            "name": "列数",
            "label": "列数",
            "ctl": [
             {
              "t": "in"
             }
            ],
            "v": [
             "10"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝自販機 のとき】レイアウトの列数（1, 2, 3…）。例：10",
            "meta": "<code>model.vm_cols</code>　smallint",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:自販機/最大収納数（自販機）",
            "name": "最大収納数（自販機）",
            "label": "最大収納数（自販機）",
            "ctl": [
             {
              "t": "in",
              "ro": 1
             }
            ],
            "v": [
             "428"
            ],
            "req": "req",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝自販機 のとき】下のレイアウトから自動で出す（読み取り専用）。【算出式は要確認：現行画面の例（468）が、各マスの数字の単純な合計と合わない】",
            "meta": "<code>model.max_items</code>　integer",
            "corp": "0",
            "ro": "1",
            "rop": "1",
            "na": "0",
            "edit": "0",
            "mi": 0
           },
           {
            "k": "kp:自販機/レイアウト生成",
            "name": "レイアウト生成",
            "label": "レイアウト生成",
            "ctl": [
             {
              "t": "btn",
              "cls": "mini act",
              "label": "レイアウト生成"
             }
            ],
            "v": [],
            "req": "req",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝自販機 のとき】段数（行）×列数のマスを作る。作った直後はすべて「シングル8」。【作り直したときにそれまでの設定が消えるかは要確認】",
            "meta": "<code>—（操作）</code>",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1"
           }
          ]
         },
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:自販機/自販機レイアウト",
            "label": "自販機レイアウト",
            "ctl": [
             {
              "t": "vmbox"
             }
            ],
            "v": [
             {
              "cols": 10,
              "rows": [
               {
                "h": "A",
                "c": [
                 {
                  "t": "ダブル10",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル10",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル10",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル10",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル10",
                  "span": 2,
                  "off": false
                 }
                ]
               },
               {
                "h": "B",
                "c": [
                 {
                  "t": "ダブル8",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル8",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル8",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル8",
                  "span": 2,
                  "off": false
                 },
                 {
                  "t": "ダブル8",
                  "span": 2,
                  "off": false
                 }
                ]
               },
               {
                "h": "C",
                "c": [
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": true
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": true
                 }
                ]
               },
               {
                "h": "D",
                "c": [
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": true
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": true
                 }
                ]
               },
               {
                "h": "E",
                "c": [
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": true
                 },
                 {
                  "t": "シングル8",
                  "span": 1,
                  "off": true
                 }
                ]
               },
               {
                "h": "F",
                "c": [
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ベルト5",
                  "span": 1,
                  "off": false
                 },
                 {
                  "t": "ダブル8",
                  "span": 2,
                  "off": false
                 }
                ]
               }
              ]
             }
            ],
            "ctlCls": "ctl vmbox",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "マスを選んで（行見出しを押すと行ごと選べる）、シングル8／シングル10／ダブル8／ダブル10／ベルト5 のボタンで種類を決める。ダブルは横2マスを1マスにまとめる。マスを選んでいないときはボタンを押せない／選んだマスを無効（使わないマス）にする／有効に戻す。無効のマスはグレーで出る",
            "meta": "<code>model_vm_cell.row / model_vm_cell.col / model_vm_cell.slot_type / model_vm_cell.span / model_vm_cell.enabled</code>",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "style": "grid-column:1/-1"
           }
          ]
         }
        ]
       },
       {
        "t": "kpanel",
        "k": "電子レンジ",
        "blocks": [
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:電子レンジ/電子レンジメーカー",
            "name": "電子レンジメーカー",
            "label": "電子レンジメーカー",
            "ctl": [
             {
              "t": "sel",
              "o": [
               "パナソニック",
               "シャープ"
              ]
             }
            ],
            "v": [
             "パナソニック"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝電子レンジ のとき】ドロップダウン。その区分のときは必須。例：パナソニック。【選択肢は要確認】",
            "meta": "<code>model.maker</code>　varchar(60)",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:電子レンジ/出力",
            "name": "出力",
            "label": "出力",
            "ctl": [
             {
              "t": "box",
              "tag": "div",
              "cls": "num",
              "kids": [
               {
                "t": "in",
                "style": "width:80px"
               },
               {
                "t": "txt",
                "tag": "span",
                "cls": "unit",
                "text": "W"
               }
              ]
             }
            ],
            "v": [
             "1200"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝電子レンジ のとき】W。その区分のときは必須。例：1200",
            "meta": "<code>model.output_w</code>　integer",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:電子レンジ/庫内容量",
            "name": "庫内容量",
            "label": "庫内容量",
            "ctl": [
             {
              "t": "box",
              "tag": "div",
              "cls": "num",
              "kids": [
               {
                "t": "in",
                "style": "width:80px"
               },
               {
                "t": "txt",
                "tag": "span",
                "cls": "unit",
                "text": "L"
               }
              ]
             }
            ],
            "v": [
             "26"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝電子レンジ のとき】L。例：26",
            "meta": "<code>model.inner_capacity_l</code>　integer",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           }
          ]
         }
        ]
       },
       {
        "t": "kpanel",
        "k": "ホットウォーマー",
        "blocks": [
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:ホットウォーマー/ホットウォーマーメーカー",
            "name": "ホットウォーマーメーカー",
            "label": "ホットウォーマーメーカー",
            "ctl": [
             {
              "t": "sel",
              "o": [
               "アンナカ",
               "タイジ"
              ]
             }
            ],
            "v": [
             "アンナカ"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝ホットウォーマー のとき】ドロップダウン。その区分のときは必須。例：アンナカ。【選択肢は要確認】",
            "meta": "<code>model.maker</code>　varchar(60)",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:ホットウォーマー/保温温度",
            "name": "保温温度",
            "label": "保温温度",
            "ctl": [
             {
              "t": "in"
             }
            ],
            "v": [
             "60"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝ホットウォーマー のとき】例：60。【画面に単位の表示がない。℃で持つかは要確認】",
            "meta": "<code>model.keep_temp</code>　smallint",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           },
           {
            "k": "kp:ホットウォーマー/段数",
            "name": "段数",
            "label": "段数",
            "ctl": [
             {
              "t": "in"
             }
            ],
            "v": [
             "3"
            ],
            "req": "cond",
            "tags": [
             [
              "p1",
              "P1"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝ホットウォーマー のとき】例：3",
            "meta": "<code>model.tiers</code>　smallint",
            "corp": "0",
            "ro": "1",
            "rop": "0",
            "na": "0",
            "edit": "1",
            "mi": 0
           }
          ]
         }
        ]
       },
       {
        "t": "kpanel",
        "k": "資材ボックス",
        "blocks": [
         {
          "t": "cols",
          "fields": [
           {
            "k": "kp:資材ボックス/資材ボックスの欄",
            "name": "資材ボックスの欄",
            "label": "資材ボックスの欄",
            "ctl": [
             {
              "t": "ta",
              "rows": 2,
              "ro": 1
             }
            ],
            "v": [
             "区分ごとの欄・最大収納数はありません（寸法・重量は規格・サイズ、「重ね置きできる」などの注意は機種備考。プランごとの個数はプランマスタの標準貸出設備）"
            ],
            "tags": [
             [
              "pn",
              "P2新"
             ],
             [
              "only",
              "法人に出さない"
             ]
            ],
            "note": "【機種区分＝資材ボックス のとき】区分ごとの欄は持たない。<b>（2026/09/29・28-162）最大収納数も持たない</b>（食数の容量判定に使わないため、⑫-2 の必須から外した）。<b>種類ごとに1機種で登録する</b>（28-161）：標準ボックス《仕切り皿》《深皿》《フード類》（W260×D370×H170mm・重ね置きできる）／タンス型ボックス（大・W600×D400×H860mm、キャスター付き920mm・約7kg）／カゴ。寸法・重量は「規格・サイズ」、「重ね置きできる」「フード類のボックスは衛生上、床に直置きしない」などの注意は「機種備考」に書く。<b>プランごとのデフォルト（どれを何個）は機種マスタではなくプランマスタの「標準貸出設備」が持つ</b>（28-160）",
            "meta": "<code>—（なし）</code>",
            "corp": "0",
            "ro": "1",
            "rop": "1",
            "na": "0",
            "edit": "0",
            "newf": 1,
            "mi": 0
           }
          ]
         }
        ]
       }
      ],
      "corp": "0"
     }
    ]
   },
   {
    "id": "md-1",
    "cards": [
     {
      "title": "標準設備対象プラン",
      "blocks": [
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-1/初期料金（税抜き）",
          "name": "初期料金（税抜き）",
          "label": "初期料金（税抜き）",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "num": 1,
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "円"
             }
            ]
           }
          ],
          "v": [
           "40,000"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "設置時に1回だけかかる額。【税抜きで持ち、税率の欄は持たない（設備は10%で計算）。子契約①の費目行にも税抜のまま入り、消費税は請求書で上乗せする（2026/09/25）】0円も登録できる（資材ボックスは 初期0・月額0）",
          "meta": "<code>model.initial_fee</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-1/月額料金（税抜き）",
          "name": "月額料金（税抜き）",
          "label": "月額料金（税抜き）",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "num": 1,
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "円"
             }
            ]
           }
          ],
          "v": [
           "5,000"
          ],
          "req": "req",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "毎月かかる額。子契約①の費目行に【出どころ区分＝model】として税抜のまま自動で入る（消費税は請求書で上乗せ）",
          "meta": "<code>model.monthly_fee</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-1/税率",
          "name": "税率",
          "label": "税率",
          "ctl": [
           {
            "t": "sel",
            "o": [
             "8%（軽減）",
             "10%"
            ]
           }
          ],
          "v": [
           "10%"
          ],
          "req": "req",
          "tags": [
           [
            "pn",
            "P2新"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "初期料金・月額料金・解約時の回収額（すべて税抜）の税率。税率マスタから選ぶ（2026/10/03 決定。既定 10%）",
          "meta": "<code>model.tax_rate_id</code>　bigint",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "newf": 1,
          "mi": 0
         },
         {
          "k": "md-1/解約時の回収額（備品サポート費用）",
          "name": "解約時の回収額（備品サポート費用）",
          "label": "解約時の回収額（備品サポート費用）",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "num": 1,
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "円"
             }
            ]
           }
          ],
          "v": [
           "15,000"
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "【最低利用期間内に解約したときの、この設備1台あたりの違約金（税抜き）】（2026/09/17 決定）。画面の注記：※無料対象プランであっても、最低利用期間内の解約には違約金が発生します。違約金は設備ごとに判定して合算する。<b>（2026/09/23 決定 2B）ここが標準額。契約側の「解約時の回収額（上書き）」が入っていればそちらを優先する。</b>自販機のように設置条件で撤去費が変わる機種は、契約ごとに上書きして使う。【これまでの「解約違約金は共通の固定額（オプション・その他料金マスタ）」との関係は要確認】",
          "meta": "<code>model.cancel_fee</code>　integer",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         },
         {
          "k": "md-1/最低利用期間",
          "name": "最低利用期間",
          "label": "最低利用期間",
          "ctl": [
           {
            "t": "box",
            "tag": "div",
            "cls": "num",
            "kids": [
             {
              "t": "in",
              "style": "width:80px"
             },
             {
              "t": "txt",
              "tag": "span",
              "cls": "unit",
              "text": "ヶ月"
             }
            ]
           }
          ],
          "v": [
           "3"
          ],
          "req": "cond",
          "tags": [
           [
            "p1",
            "P1"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "ヶ月。機種ごとに違う（例：冷蔵庫3ヶ月・自販機12ヶ月。2026/10/01 STEP2 回答 Q8・項目一覧 §0.6）。貸出日 ＋ この期間 − 1日 が設備ごとの満了日になり、それより前の解約で「解約時の回収額」がかかる。資材ボックスなど無償のものは空欄（期間なし）",
          "meta": "<code>model.min_term_months</code>　smallint",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "mi": 0
         }
        ]
       }
      ],
      "corp": "0"
     }
    ]
   },
   {
    "id": "md-2",
    "cards": [
     {
      "title": "貸出中の拠点",
      "blocks": [
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-2/回収未完了（アラート）",
          "name": "回収未完了（アラート）",
          "label": "回収未完了（アラート）",
          "ctl": [
           {
            "t": "in",
            "ro": 1
           }
          ],
          "v": [
           "2 件（CU00871・CU01204）"
          ],
          "req": "req",
          "tags": [
           [
            "pn",
            "P2新"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "返却予定日 < 今日 かつ 未返却数 > 0 の件数。機種ごとに見られると、どの設備の回収が滞っているかが分かる",
          "meta": "<code>—（算出）</code>",
          "corp": "0",
          "ro": "1",
          "rop": "1",
          "na": "0",
          "edit": "0",
          "newf": 1,
          "mi": 0
         }
        ]
       },
       {
        "t": "table",
        "key": "貸出中の拠点",
        "head": [
         {
          "text": "貸出ID",
          "corp": "0"
         },
         {
          "text": "拠点ID",
          "corp": "0"
         },
         {
          "text": "拠点名",
          "corp": "0"
         },
         {
          "text": "個体番号",
          "corp": "0"
         },
         {
          "text": "未返却数",
          "corp": "0",
          "cls": "r"
         },
         {
          "text": "貸出日",
          "corp": "0"
         },
         {
          "text": "返却予定日",
          "corp": "0"
         },
         {
          "text": "貸出ステータス",
          "corp": "0"
         }
        ],
        "rows": [
         {
          "c": [
           {
            "corp": "0",
            "text": "LN-0001"
           },
           {
            "corp": "0",
            "text": "CU00643"
           },
           {
            "corp": "0",
            "text": "株式会社サンプル"
           },
           {
            "corp": "0",
            "text": "SN-RF-00142"
           },
           {
            "corp": "0",
            "text": "1"
           },
           {
            "corp": "0",
            "text": "2026/03/28"
           },
           {
            "corp": "0",
            "text": "—"
           },
           {
            "corp": "0",
            "text": "貸出中"
           }
          ]
         },
         {
          "c": [
           {
            "corp": "0",
            "text": "LN-0112"
           },
           {
            "corp": "0",
            "text": "CU00871"
           },
           {
            "corp": "0",
            "text": "株式会社サンプル 大阪支店"
           },
           {
            "corp": "0",
            "text": "SN-RF-00201"
           },
           {
            "corp": "0",
            "text": "1"
           },
           {
            "corp": "0",
            "text": "2025/11/04"
           },
           {
            "corp": "0",
            "text": "2026/02/28"
           },
           {
            "corp": "0",
            "text": "未返却"
           }
          ]
         },
         {
          "c": [
           {
            "corp": "0",
            "text": "LN-0143"
           },
           {
            "corp": "0",
            "text": "CU01204"
           },
           {
            "corp": "0",
            "text": "株式会社ホクト"
           },
           {
            "corp": "0",
            "text": "—"
           },
           {
            "corp": "0",
            "text": "1"
           },
           {
            "corp": "0",
            "text": "2025/07/15"
           },
           {
            "corp": "0",
            "text": "2026/01/31"
           },
           {
            "corp": "0",
            "text": "未返却"
           }
          ]
         },
         {
          "c": [
           {
            "corp": "0",
            "text": "LN-0208"
           },
           {
            "corp": "0",
            "text": "CU00902"
           },
           {
            "corp": "0",
            "text": "株式会社サンプル 名古屋営業所"
           },
           {
            "corp": "0",
            "text": "SN-RF-00318"
           },
           {
            "corp": "0",
            "text": "1"
           },
           {
            "corp": "0",
            "text": "2026/06/01"
           },
           {
            "corp": "0",
            "text": "—"
           },
           {
            "corp": "0",
            "text": "配送中"
           }
          ]
         }
        ]
       },
       {
        "t": "cols",
        "fields": [
         {
          "k": "md-2/CSVエクスポート",
          "name": "CSVエクスポート",
          "label": "CSVエクスポート",
          "ctl": [
           {
            "t": "btn",
            "cls": "mini act",
            "label": "CSVエクスポート"
           }
          ],
          "v": [],
          "tags": [
           [
            "pn",
            "P2新"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "この機種を貸している拠点を書き出す。リコール・入替の連絡に使う",
          "meta": "<code>—（操作）</code>",
          "corp": "0",
          "ro": "1",
          "rop": "0",
          "na": "0",
          "edit": "1",
          "newf": 1
         },
         {
          "k": "md-2/貸出中 合計",
          "name": "貸出中 合計",
          "label": "貸出中 合計",
          "ctl": [
           {
            "t": "in",
            "ro": 1
           }
          ],
          "v": [
           "96 台（78拠点）"
          ],
          "req": "req",
          "tags": [
           [
            "pn",
            "P2新"
           ],
           [
            "only",
            "法人に出さない"
           ]
          ],
          "note": "この機種をいま何台貸しているか。値上げ・入替の影響を見る数字",
          "meta": "<code>—（算出）</code>",
          "corp": "0",
          "ro": "1",
          "rop": "1",
          "na": "0",
          "edit": "0",
          "newf": 1,
          "mi": 0
         }
        ]
       }
      ],
      "corp": "0"
     },
     {
      "title": "履歴（機種マスタ）",
      "blocks": [
       {
        "t": "table",
        "key": "履歴（機種マスタ）",
        "head": [
         {
          "text": "変更日時",
          "corp": "0"
         },
         {
          "text": "変更内容",
          "corp": "0"
         },
         {
          "text": "変更者",
          "corp": "0"
         },
         {
          "text": "変更区分",
          "corp": "0"
         }
        ],
        "rows": [
         {
          "c": [
           {
            "corp": "0",
            "text": "2026/09/16 14:20"
           },
           {
            "corp": "0",
            "text": "月額料金（税抜き）「4,500」→「5,000」"
           },
           {
            "corp": "0",
            "text": "運営 佐藤"
           },
           {
            "corp": "0",
            "text": "手入力"
           }
          ]
         },
         {
          "c": [
           {
            "corp": "0",
            "text": "2026/02/01 11:00"
           },
           {
            "corp": "0",
            "text": "解約時の回収額（備品サポート費用）「—」→「15,000」"
           },
           {
            "corp": "0",
            "text": "山田"
           },
           {
            "corp": "0",
            "text": "手入力"
           }
          ]
         },
         {
          "c": [
           {
            "corp": "0",
            "text": "2026/01/30 14:32"
           },
           {
            "corp": "0",
            "text": "データ登録"
           },
           {
            "corp": "0",
            "text": "CSV取込"
           },
           {
            "corp": "0",
            "text": "CSV取込"
           }
          ]
         }
        ]
       }
      ],
      "corp": "0"
     }
    ]
   }
  ]
 }
};
