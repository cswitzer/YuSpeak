import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { type AnalysisResponse } from "@/services/speechService";

export default function FeedbackResults({
  analysis,
}: {
  analysis: AnalysisResponse;
}) {
  const { evaluation, pronunciation } = analysis;

  return (
    <div className="space-y-6">
      {/* Evaluation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold">
              {evaluation.overall_score}/10
            </span>
            <div className="flex gap-2">
              <Badge>Grammar: {evaluation.grammar_score}</Badge>
              <Badge>Vocabulary: {evaluation.vocabulary_score}</Badge>
              <Badge>Fluency: {evaluation.fluency_score}</Badge>
            </div>
          </div>
          <Accordion type="single" collapsible>
            <AccordionItem value="mistakes">
              <AccordionTrigger>Mistakes</AccordionTrigger>
              <AccordionContent>
                {evaluation.mistakes.map((m, i) => (
                  <div key={i} className="mb-2">
                    <Badge variant="outline">{m.type}</Badge>
                    <div>Original: {m.original}</div>
                    <div>Corrected: {m.corrected}</div>
                    <div className="text-sm text-muted-foreground">
                      {m.explanation}
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="mt-4">
            <div>Original: {evaluation.original_sentence}</div>
            <div>Corrected: {evaluation.corrected_sentence}</div>
            <div>Native: {evaluation.more_natural_native_version}</div>
          </div>
          <div className="mt-4 p-2 bg-muted rounded">
            {evaluation.overall_feedback}
          </div>
        </CardContent>
      </Card>

      {/* Pronunciation Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pronunciation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold">{pronunciation.overall}</span>
            <div className="flex gap-2">
              <Badge>Accuracy: {pronunciation.accuracy}</Badge>
              <Badge>Fluency: {pronunciation.fluency}</Badge>
              <Badge>Completeness: {pronunciation.completeness}</Badge>
            </div>
          </div>
          <Accordion type="multiple">
            {pronunciation.words.map((word, i) => (
              <AccordionItem key={i} value={`word-${i}`}>
                <AccordionTrigger>
                  {word.word} <span className="ml-2">({word.score})</span>
                </AccordionTrigger>
                <AccordionContent>
                  {word.phonemes.map((p, j) => (
                    <div key={j} className="flex justify-between">
                      <span>{p.phoneme}</span>
                      <Progress value={p.score} className="w-1/2" />
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
