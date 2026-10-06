import copy, json, unittest
from tools.fieldnote import ROOT,load,validate,markdown
class FieldnoteTests(unittest.TestCase):
    def setUp(self): self.record=load(ROOT/'examples/dialogue.fieldnote.yaml')
    def test_examples_match(self):
        self.assertEqual(self.record,load(ROOT/'examples/dialogue.fieldnote.json'))
        self.assertEqual(validate(self.record),[])
    def test_decided_requires_answer(self):
        self.record['decisions'][0]['status']='decided'
        self.assertTrue(validate(self.record))
    def test_not_applicable_requires_reason(self):
        self.record['decisions'][0]['status']='not-applicable'
        self.assertTrue(validate(self.record))
    def test_duplicate_id_rejected(self):
        self.record['decisions'].append(copy.deepcopy(self.record['decisions'][0]))
        self.assertIn('decisions: duplicate IDs',validate(self.record))
    def test_unknown_check_reference_rejected(self):
        self.record['checks'][0]['decisions']=['missing']
        self.assertTrue(validate(self.record))
    def test_open_questions_survive_render(self):
        doc=markdown(self.record)
        self.assertIn('**open**',doc)
        self.assertIn('verification results',doc)
    def test_questionless_decision_and_render(self):
        record=load(ROOT/'examples/custom.fieldnote.yaml')
        self.assertEqual(validate(record),[])
        doc=markdown(record)
        self.assertIn('remove-filter',doc)
        self.assertIn('removal-feedback',doc)
        self.assertIn('**open**',doc)
    def test_older_schema_version_rejected(self):
        self.record['schemaVersion']='0.1.0'
        self.assertTrue(validate(self.record))
    def test_version_011_allows_omitted_question(self):
        del self.record['decisions'][0]['question']
        self.assertEqual(validate(self.record),[])
    def test_unknown_schema_version_rejected(self):
        self.record['schemaVersion']='../../missing'
        self.assertTrue(validate(self.record))
    def test_results_need_environment_and_revision(self):
        result={'schemaVersion':'0.1.1','fieldnote':'dialogue.fieldnote.yaml','componentRevision':'abc123','results':[{'check':'initial-focus-check','outcome':'passed','observedAt':'2026-10-06T10:00:00Z','environment':'Firefox, keyboard','evidence':'Focused Cancel on opening.'}]}
        self.assertEqual(validate(result,True),[])
        del result['results'][0]['environment'];self.assertTrue(validate(result,True))
if __name__=='__main__': unittest.main()
