	S A U R U S _ S Y N C - I N F O R M A Ç Õ E S _ S O B R E _ O _ P R O G R A M A

____________________________________________________________________________________________________

DADOS A SEREM INSERIDOS:

|  TRAY  |
Code: O code pode ser encontrado ao baixar o aplicativo SaurusSync na aba "Aplicativos" da plataforma tray, ao baixar o aplicativo, basta acessa-lo e copiar o code que será exibido
URL: A URL pode ser encontrada ao baixar o aplicativo SaurusSync na aba "Aplicativos" da plataforma tray, ao baixar o aplicativo, basta acessa-lo e copiar a URL que será exibido


|  SAURUS  |
Chave Caixa: Deve ser inserido a chave caixa de qualquer um dos caixas. (Serve apenas para autenticação) (Os hífens devem ser mantidos)

Domínio: Domínio da empresa (exemplo: testesdrsistema, dellamutta, etc...)


|  GERAL  |
Timer: O timer deve ser inserido no seguinte padrão (miutos:segundos) (exemplo: 20:00). O timer se refere ao tempo de intervalo na requisição contínua. O intervalo em que cada sincronização será realizada. (Olhar a OBS 1);


|  SINCRONIZAR  |
Data/Horário: A partir de qual data/horário deverá ser feita a requisição. Exemplo: Caso seja inserio a data (01/05/2023 09:00) ao fazer a requisição única todos os produtos cadastrados e que não sofreram alteração anterior a data informada não será retornados no XML do webservice, logo não serão cadastrados. 


____________________________________________________________________________________________________


INDICAÇÕES:

É aconselhado que seja feito primeiramente a Sincrinização Única (inserir data bem antiga para que seja trazido todos os produtos do Saurus) e após isso seja utilizado Sincronuzação Contínua para fazer análise de mudanças regularmente. 

Como apenas a Sinc. Única realiza sincronização de estoque, aconselha-se que seja sincronizado estoque ao fim do dia. Pois a Sinc. Contínua não sincroniza estoque devido a sobrecarga que é a sincronização de estoque

Fazer backup com frequência do arquivo produtos.json

---------- RESUMO: APENAS USAR SINCRONIZAÇÃO ÚNICA PARA CARGA INICIAL, CONTÍNUA PARA ATUALIZAÇÕES E AO FIM DO DIA SINCRONIZAR ESTOQUE  ----------


____________________________________________________________________________________________________


OBSERVAÇÕES:
1- Após testes realizados, foi notado que a API do Saurus tem mau funcionamento com a entrega dos produtos cadastrados quando se tem um horário de requisição inferior a aproximadamente 45 minutos, devido a isso é solicitado, por seguranda que seja inserido um horário suporerior ou igual a uma hora.

2- O WebService do Saurus possibilita a busca pelo estoque apenas fazendo uma requisição, devido a isso, caso tenha 10.000 pridutos, o pograma irá fazer 10.000 requisições, 10.000 dowloads de XML de produtos, e 10.000 leituras, devido a isso foi desenvolvido a sincronização de estoque.

3- A Sincronização Única sincroniza o estoque, produtos, e preço. Sendo assim uma requisição mais pesada que se faz apenas uma vez. Ele deve ser usado como carga inicial, pois produtos alterados não serão alterados na tray. Apenas feito seu cadastro inicial. Mudanças são sincronizadas pela Sincronização Continua.


____________________________________________________________________________________________________


PASTAS E ARQUIVOS:

.\GravacaoXML: Os XMLs retornados das requisições de produtos cadastrados Saurus. Usado para análise do funcionamento do WebService e do retorno adequado a API.

.\GravacaoXMLprodutoEstoque: Os XMLs retornados das requisições de consultas de estoque. Um XML é gerado para cada produto. 

.\logs: Pasta que contém as mensagens, logs de sucesso e erro. Inicialmente é bom fazer uma análise sobre os logs para verificar andamento e funcionamento do programa.

.\Integrador\src\build\dados.json: Os dados cadastrados no programa são guardados e lidos a partir deste arquivo JSON

.\Integrador\src\build\produtos.json: O arquivo de maior importância, seria o banco de dados do programa. O programa que relaciona o id Saurus ao id Tray, graças a este arquivo é possível fazer alterações nos produtos, não duplicar produtos. Caso este arquivo seja perdido, o estoque, base será completamente duplicado.

____________________________________________________________________________________________________
