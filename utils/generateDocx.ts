import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ShadingType,
} from 'docx';
import { FormData } from '../types/form';

function sectionHeader(title: string): Paragraph {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    shading: { type: ShadingType.SOLID, color: '3dbce7', fill: '3dbce7' },
    run: { color: 'FFFFFF', bold: true, size: 22 },
    alignment: AlignmentType.CENTER,
  });
}

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: 20 }),
      new TextRun({ text: value || '—', size: 20 }),
    ],
  });
}

function buildDependentsTable(form: FormData): Table {
  const headerRow = new TableRow({
    children: ['#', 'Nome', 'Parentesco', 'Nascimento', 'CPF'].map(
      (text) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text, bold: true, size: 18 })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { type: ShadingType.SOLID, color: '3dbce7', fill: '3dbce7' },
          width: { size: 20, type: WidthType.PERCENTAGE },
        })
    ),
  });

  const dataRows = form.dependentes.map(
    (dep, idx) =>
      new TableRow({
        children: [
          String(idx + 1),
          dep.nome,
          dep.parentesco,
          dep.nascimento,
          dep.cpf,
        ].map(
          (text) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: text || '—', size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: { size: 20, type: WidthType.PERCENTAGE },
            })
        ),
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideH: { style: BorderStyle.SINGLE, size: 1 },
      insideV: { style: BorderStyle.SINGLE, size: 1 },
    },
    rows: [headerRow, ...dataRows],
  });
}

export async function generateAndDownloadDocx(form: FormData): Promise<void> {
  const children = [
    new Paragraph({
      text: 'Sindicato dos Engenheiros no Estado do Ceará — SENGE-CE',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    new Paragraph({
      text: 'Atualização Cadastral',
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [new TextRun({ text: 'Atualização Cadastral', size: 24, color: '555555' })],
    }),

    sectionHeader('Dados Pessoais'),
    labelValue('Nome', form.nome),
    labelValue('Nome da Mãe', form.nomeMae),
    labelValue('Data de Nascimento', form.dataNascimento),
    labelValue('Estado Civil', form.estadoCivil),
    labelValue('Nacionalidade', form.nacionalidade),
    labelValue('Naturalidade', form.naturalidade),
    labelValue('CPF', form.cpf),
    labelValue('RG', form.rg),

    sectionHeader('Endereço'),
    labelValue('Residência', form.residencia),
    labelValue('Bairro', form.bairro),
    labelValue('CEP', form.cep),
    labelValue('Cidade', form.cidade),
    labelValue('Estado', form.estado),
    labelValue('Telefones de Contato', form.telefonesContato),
    labelValue('Celular (WhatsApp)', form.celularWhatsapp),
    labelValue('E-mail', form.email),

    sectionHeader('Dados Profissionais'),
    labelValue('Curso de Graduação', form.cursoGraduacao),
    labelValue('Outras Titulações', form.outrasTitulacoes),
    labelValue('Instituição', form.instituicao),
    labelValue('Ano da Colação de Grau', form.anoColacaoGrau),
    labelValue('Carteira Confea-RNP nº', form.carteiraConfeaRnp),
    labelValue('Data de Emissão', form.dataEmissao),

    sectionHeader('Atividades Profissionais'),
    labelValue('Empresa onde trabalha', form.empresaOndeTrabalha),
    labelValue('Data de Admissão', form.dataAdmissao),
    labelValue('Cargo', form.cargo),
    labelValue('Telefone', form.telefoneEmpresa),
    labelValue('Endereço', form.enderecoEmpresa),

    sectionHeader('Dependentes para Unimed'),
  ];

  if (form.dependentes.length > 0) {
    children.push(buildDependentsTable(form) as unknown as Paragraph);
  } else {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Nenhum dependente cadastrado.', italics: true, size: 20, color: '888888' })],
        spacing: { before: 100 },
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          size: 16,
          color: '888888',
          italics: true,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 400 },
    })
  );

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `atualizacao-cadastral-${form.nome.replace(/\s+/g, '-').toLowerCase() || 'senge'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
