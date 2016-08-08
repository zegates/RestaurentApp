import Ember from 'ember';

let printUtil = Ember.Object.extend({

  leftSpaceA4PT: 40,
  leftSpacePos: 10,


  fontSizeText: 12,
  fontSizeHeader: 16,

  textYInc: 20,
  topHeaderYInc: 20,

  tableYPos: 10,

  generateDoc(){
    return new jsPDF('p', 'pt');
  },

  addText(doc, text, yPos){
    doc.setFontSize(this.fontSizeText);
    doc.setFontStyle('normal');
    doc.text(text, this.leftSpaceA4PT, yPos += this.textYInc);
    return [doc, yPos];
  },

  addHeader(doc, text, yPos){
    doc.setFontSize(this.fontSizeHeader);
    doc.setFontStyle('bold');
    doc.text(text, this.leftSpaceA4PT, yPos += this.textYInc);
    return [doc, yPos];
  },

  addTopHeader(doc, text, yPos){
    doc.setFontSize(this.fontSizeHeader);
    doc.setFontStyle('bold');
    doc.text(text, this.leftSpaceA4PT, yPos += this.topHeaderYInc);
    return [doc, yPos];
  },

  addTable(doc, cols, rowData, yPos, theme){
    doc.autoTable(cols, rowData, {startY: yPos += this.tableYPos, theme: theme});
    yPos = doc.autoTableEndPosY();
    return [doc, yPos];
  }

});

export default printUtil.create();
