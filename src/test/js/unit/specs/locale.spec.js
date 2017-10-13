/**
 * for global include locale message generator in `jawr.properties`
 * suppose to load even no require any dependencies
 * */
describe('i18n', function() {

  it('# check locale message is loaded normally', function() {
    var homeTitle = locale.home.title();
    expect(homeTitle).to.eq('HomePage Sample Title');
  });

  it('# check locale message with arguments loaded normally', function() {
    var homeSubTitle = locale.home.subtitle('Agile');
    expect(homeSubTitle).to.eq('Agile Page SubTitle');
  });

  describe('special characters in locale message properties', function() {

    it('# check json array value in locale message properties', function() {
      expect(typeof locale.framework.options).to.eq('function');
    });

    it('# check if boolean value in locale message properties', function() {
      expect(typeof locale.framework.enable).to.eq('function');
      expect(typeof locale.framework.enable()).to.eq('string');
      expect(locale.framework.enable()).to.eq('true');
    });

    it('# check if string value contains escape characters', function() {
      expect(typeof locale.home.description).to.eq('function');
    });
  });
});
