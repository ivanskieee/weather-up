<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WeatherController extends Controller
{
    public function askWeather(Request $request)
    {
        $userInput = $request->input('query');
        $cohereResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('COHERE_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.cohere.ai/v1/chat', [
            'model' => 'command-r-plus',
            'message' => "Extract the most specific city, municipality, or district in the Philippines mentioned in this sentence: \"$userInput\". Respond ONLY with the place name.",
        ]);

        $location = trim($cohereResponse['text'] ?? '');

        $map = [
            'bgc' => 'Bonifacio Global City',
            'bonifacio' => 'Bonifacio Global City',
            'manila' => 'Manila',
            'makati' => 'Makati',
            'qc' => 'Quezon City',
        ];

        $locationLower = strtolower($location);
        if (isset($map[$locationLower])) {
            $location = $map[$locationLower];
        }

        if (empty($location)) {
            $location = 'Manila';
        }

        $geo = Http::get("https://geocoding-api.open-meteo.com/v1/search", [
            'name' => $location,
            'count' => 1,
            'country' => 'PH',
        ]);

        if (!isset($geo['results'][0])) {
            return response()->json(['error' => 'Location not found'], 404);
        }

        $lat = $geo['results'][0]['latitude'];
        $lon = $geo['results'][0]['longitude'];

        $weather = Http::get("https://api.open-meteo.com/v1/forecast", [
            'latitude' => $lat,
            'longitude' => $lon,
            'current' => 'temperature_2m,weathercode',
        ]);

        return response()->json([
            'location' => $location,
            'weather' => $weather['current'] ?? [],
        ]);
    }
}
