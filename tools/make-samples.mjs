/**
 * Generates the demo import workbook shown in the blog screenshots and tests.
 * Run: node tools/make-samples.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx-js-style';

const headers = [
  '姓名',
  '公司',
  '职位',
  '生日',
  '标签',
  '收藏',
  '手机1',
  '手机2',
  '手机3',
  '邮箱1',
  '邮箱2',
  '微信',
  'QQ',
  '地址',
  '其他',
  '备注',
];

const rows = [
  [
    '沈知微',
    '青屿工作室',
    '插画师',
    '1997-03-12',
    '设计、朋友',
    '否',
    '13800001234',
    '',
    '',
    'zhiwei@example.com',
    '',
    'zhiwei_art',
    '',
    '上海市静安区愚园路 1088 弄',
    '站酷: zhiiwei',
    '在插画展认识的新朋友',
  ],
  [
    '林晚',
    '澄野设计',
    '产品设计师',
    '1996-04-18',
    '设计、客户',
    '是',
    '13800138021',
    '13900001111',
    '',
    'wan.lin@chengye.design',
    '',
    'linwan_design',
    '',
    '上海市徐汇区安福路 288 号 502',
    '小红书: @林晚设计',
    '导入更新：新增一个工作手机号',
  ],
  [
    '程野',
    '北辰建筑',
    '结构工程师',
    '1992-11-05',
    '合作、建筑',
    '否',
    '13600005678',
    '021-55667788',
    '',
    'cheng.ye@beichen.build',
    '',
    'chengye_structure',
    '',
    '上海市杨浦区国定路 335 号',
    '',
    '桥梁项目对接人',
  ],
  [
    '',
    '未知公司',
    '未知职位',
    '',
    '待整理',
    '否',
    '13100000000',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '这一行没有姓名，会被跳过',
  ],
  [
    '潘越',
    '云舟数据',
    '数据分析师',
    '1998-07-21',
    '技术、同学',
    '否',
    '13500009999',
    '',
    '',
    'not-an-email',
    '',
    'panyue_data',
    '',
    '杭州市余杭区文一西路 969 号',
    '',
    '邮箱写错时只提示，不会阻止其它字段导入',
  ],
  [
    '李沐',
    '风物志编辑部',
    '编辑',
    '1993-02-14',
    '出版、阅读',
    '否',
    '13700002468',
    '',
    '',
    'limu@fengwuzhi.press',
    '',
    'limu_editor',
    '',
    '南京市秦淮区老门东 12 号',
    '',
    '',
  ],
  [
    '沈知微',
    '青屿工作室',
    '插画师',
    '',
    '设计、朋友',
    '否',
    '13800001234',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '文件内重复行：按姓名 + 手机号识别',
  ],
];

const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
worksheet['!cols'] = [
  { wch: 12 },
  { wch: 18 },
  { wch: 14 },
  { wch: 13 },
  { wch: 15 },
  { wch: 8 },
  { wch: 16 },
  { wch: 16 },
  { wch: 14 },
  { wch: 26 },
  { wch: 22 },
  { wch: 16 },
  { wch: 12 },
  { wch: 30 },
  { wch: 24 },
  { wch: 34 },
];
worksheet['!rows'] = [{ hpt: 28 }, ...rows.map(() => ({ hpt: 23 }))];
worksheet['!autofilter'] = { ref: `A1:P${rows.length + 1}` };
headers.forEach((header, columnIndex) => {
  const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
  if (cell) {
    cell.s = {
      font: { name: 'Microsoft YaHei', bold: true, color: { rgb: 'FFFFFF' } },
      fill: { patternType: 'solid', fgColor: { rgb: '1F332E' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }
});

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, '通讯录');
workbook.Props = {
  Title: '联络簿导入演示',
  Author: 'Liao Weibin (832402110)',
};

const outputDir = path.resolve('docs/samples');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'import-demo.xlsx');
XLSX.writeFile(workbook, outputPath, { compression: true });
console.log(`Wrote ${outputPath} (${rows.length} data rows)`);
